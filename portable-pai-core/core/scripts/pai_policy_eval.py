#!/usr/bin/env python3
import argparse
import json
import sys
from pathlib import Path
from typing import List, Optional


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def detect_mutation(command: str, mutating_tokens: List[str]) -> bool:
    c = f" {command} "
    for token in mutating_tokens:
      if token in c:
          return True
    return False


def detect_forbidden_target(command: str, forbidden_targets: List[str]) -> Optional[str]:
    for target in forbidden_targets:
        if target in command:
            return target
    return None


def command_matches_any(command: str, patterns: List[str]) -> bool:
    for pattern in patterns:
        if pattern in command:
            return True
    return False


def detect_stage(root: Path) -> str:
    stage_script = root / "scripts" / "pai_stage_detect.sh"
    if not stage_script.exists():
        return "dev"
    try:
        out = (
            __import__("subprocess")
            .check_output([str(stage_script)], text=True, cwd=str(root))
            .splitlines()
        )
        for line in out:
            if line.startswith("STAGE="):
                return line.split("=", 1)[1].strip() or "dev"
    except Exception:
        return "dev"
    return "dev"


def main():
    parser = argparse.ArgumentParser(description="Evaluate structured PAI policy")
    parser.add_argument("--policy", required=True)
    parser.add_argument("--mode", required=True)
    parser.add_argument("--actor", required=True, choices=["parent", "child"])
    parser.add_argument("--command", required=True)
    parser.add_argument("--root", required=True)
    args = parser.parse_args()

    policy = load_json(Path(args.policy))
    mode_rules = policy.get("mode_rules", {})
    global_rules = policy.get("global", {})
    stage_overrides = policy.get("stage_overrides", {})

    if args.mode not in mode_rules:
        print("DENY unknown_mode")
        return 4

    rule = mode_rules[args.mode]
    stage = detect_stage(Path(args.root))

    if args.actor == "child" and not rule.get("allow_spawn", True):
        print("DENY spawn_disallowed_in_mode")
        return 5

    mutating = detect_mutation(args.command, global_rules.get("mutating_tokens", []))

    forbidden = detect_forbidden_target(args.command, global_rules.get("forbidden_targets", []))
    if forbidden:
        print(f"DENY forbidden_target={forbidden}")
        return 6

    child_forbidden = detect_forbidden_target(
        args.command, global_rules.get("child_forbidden_targets", [])
    )
    if args.actor == "child" and child_forbidden:
        print(f"DENY child_forbidden_target={child_forbidden}")
        return 9

    child_mutation_forbidden = detect_forbidden_target(
        args.command, global_rules.get("child_forbidden_mutation_targets", [])
    )
    if args.actor == "child" and mutating and child_mutation_forbidden:
        print(f"DENY child_mutation_forbidden_target={child_mutation_forbidden}")
        return 10

    if mutating and not rule.get("allow_mutation", False):
        print("DENY mutation_disallowed_in_mode")
        return 7

    # In scoped_write child lanes, allow mutation only in explicitly-allowed
    # ephemeral locations to avoid shared-state corruption.
    if args.actor == "child" and args.mode == "scoped_write" and mutating:
        if rule.get("require_mutation_path_allowlist_for_child", False):
            allowed_prefixes = rule.get("allowed_mutation_path_prefixes_for_child", [])
            if not command_matches_any(args.command, allowed_prefixes):
                print("DENY scoped_write_mutation_target_outside_allowlist")
                return 11

    stage_rule = stage_overrides.get(stage, {})
    if args.mode == "scoped_write" and stage_rule.get("allow_scoped_write") is False:
        print("DENY scoped_write_disallowed_in_stage")
        return 8

    print(f"ALLOW stage={stage} mutating={str(mutating).lower()} mode={args.mode}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
