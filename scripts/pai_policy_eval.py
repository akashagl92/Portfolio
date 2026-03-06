#!/usr/bin/env python3
import os
import pathlib
import runpy
import sys

script_dir = pathlib.Path(__file__).resolve().parent
repo_root = script_dir.parent
canonical = repo_root / "portable-pai-core" / "core" / "scripts" / "pai_policy_eval.py"

if not canonical.exists():
    print(f"Missing canonical script: {canonical}", file=sys.stderr)
    raise SystemExit(2)

os.environ.setdefault("PAI_PROJECT_ROOT", str(repo_root))
runpy.run_path(str(canonical), run_name="__main__")
