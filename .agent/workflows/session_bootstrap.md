---
description: Enforce SHADOW hard mode at session start before any task work
---
# Session Bootstrap (SHADOW Hard Mode)

Run this workflow first in every new or reloaded session.

## Goal
Prevent native artifact drift and force orchestration writes to project-local `.pai/*` files.

## Steps
1. Run runtime preflight:
   - `scripts/pai_runtime_guard.sh status`
2. Read and echo the active profile fields:
   - `PROFILE`
   - `LOCKED`
   - `SUBAGENT_ENABLED`
   - `CAPABILITY_SPAWN_SUBAGENT`
3. Enforce SHADOW contract:
   - If `PROFILE=SHADOW` or `LOCKED=1`, native mutations are forbidden.
4. Record a bootstrap entry in `.pai/tasks/todo.md` with timestamp and session intent using a file-path shell write only:
   - `printf -- "- [ ] Session bootstrap enforced at %s (shadow hard mode)\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> .pai/tasks/todo.md`
5. Return the token:
   - `SHADOW_ENFORCED`

## SHADOW Contract (Explicit)
- Deny native artifact mutations:
  - native `Task`
  - native `Implementation Plan`
  - native `Walkthrough`
- During bootstrap, do not call any native artifact mutation tool even once.
- Allow writes only to:
  - `.pai/tasks/todo.md`
  - `.pai/plans/active_plan.md`
  - `.pai/walkthrough-final.md`

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
