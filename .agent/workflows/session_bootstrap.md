---
description: Enforce SHADOW hard mode at session start before any task work
---
# Session Bootstrap (SHADOW Hard Mode)

Run this workflow first in every new or reloaded session.

## When To Run
- At the beginning of every new chat thread.
- Immediately after IDE reload/restart.
- After any native artifact spinner/cancel/failure event.
- Before running any non-trivial workflow (`/persona_orchestration`, `/research_spawn`, `/pai_sync`).

## Goal
Prevent native artifact drift and force orchestration writes to project-local `.pai/*` files.

## Steps
1. Run runtime preflight:
   - `scripts/pai_runtime_guard.sh status`
2. Reconcile Bridge Registry (Surgical Path):
   - `cat > .pai/runtime/native_artifact_bridge/targets/task.env <<INNER_EOF`
   - `SESSION_ID="$(pwd | sed 's/.*brain\///;s/\/.*//')"`
   - `echo "SESSION_ID=\"/Users/akashagrawal/.gemini/antigravity/brain/\$SESSION_ID\"" > .pai/runtime/native_artifact_bridge/targets/task.env`
   - `INNER_EOF`
3. Emit shadow-hard banner:
   - `scripts/pai_shadow_hard_banner.sh`
   - Mandatory rule text:
     - `If NATIVE_ARTIFACTS_ALLOWED=0, ban task_boundary + native task.md/implementation_plan.md/walkthrough.md edits, use .pai/* only.`
3. Read and echo the active profile fields:
   - `PROFILE`
   - `LOCKED`
   - `SUBAGENT_ENABLED`
   - `CAPABILITY_SPAWN_SUBAGENT`
4. Enforce SHADOW contract:
   - If `PROFILE=SHADOW` or `LOCKED=1`, native mutations are forbidden.
5. Record a bootstrap entry in `.pai/tasks/todo.md` with timestamp and session intent using a file-path shell write only:
   - `printf -- "- [ ] Session bootstrap enforced at %s (shadow hard mode)\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> .pai/tasks/todo.md`
6. Return the token:
   - `SHADOW_ENFORCED`

## SHADOW Contract (Explicit)
- Deny native artifact mutations:
  - native `Task`
  - native `Implementation Plan`
  - native `Walkthrough`
- Deny native artifact mutation tools/calls:
  - `task_boundary`
  - any native edit call targeting `task.md`, `implementation_plan.md`, `walkthrough.md`
- During bootstrap, do not call any native artifact mutation tool even once.
- Allow writes only to:
  - `.pai/tasks/todo.md`
  - `.pai/plans/active_plan.md`
  - `.pai/walkthrough-final.md`

## Hard Failure Rule (Non-Negotiable)
- If `NATIVE_ARTIFACTS_ALLOWED=0` from `scripts/pai_runtime_guard.sh status`, do not attempt native artifact tools at all.
- If a native artifact tool is attempted anyway, immediately stop that lane and continue using `.pai/*` artifacts only.

## Failure Behavior
- If any native artifact action is attempted during bootstrap:
  1. Abort the native action.
  2. Continue in SHADOW-only lane.
  3. Return `SHADOW_ENFORCED_WITH_FALLBACK`.

## Optional Research Routing
- If a task is research-heavy and both flags are enabled:
  - `SUBAGENT_ENABLED=1`
  - `CAPABILITY_SPAWN_SUBAGENT=1`
- Then use `scripts/pai_subagent_ctl.sh spawn ...`.
- Otherwise continue in single-parent mode and log fallback.
