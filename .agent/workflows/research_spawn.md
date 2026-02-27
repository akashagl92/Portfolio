---
description: Run research via sub-agent spawn with strict fallback and lifecycle evidence
---
# Research Spawn Workflow (PoC)

Use this for research-heavy tasks to preserve parent context.

## Preconditions
1. Run `scripts/pai_runtime_guard.sh status`.
2. Confirm runtime flags in `.pai/runtime/profile.env`:
   - `SUBAGENT_ENABLED=1`
   - `CAPABILITY_SPAWN_SUBAGENT=1`

## Execution
1. Spawn child lane:
   - `scripts/pai_subagent_ctl.sh spawn <label> -- "<research command>"`
2. Capture spawned id from output.
3. Poll until terminal state:
   - `scripts/pai_subagent_ctl.sh status <id>`
4. Collect output:
   - `scripts/pai_subagent_ctl.sh collect <id>`

## Rules
- Child lanes must not mutate shared orchestration artifacts.
- Parent agent synthesizes and writes:
  - `.pai/plans/active_plan.md`
  - `.pai/tasks/todo.md`
  - `.pai/walkthrough-final.md`
- If `PROFILE=SHADOW` or `LOCKED=1`, do not mutate native Task/Implementation Plan/Walkthrough artifacts.
- If spawn is unavailable/fails/times out:
  - fallback to single-parent execution,
  - record failure reason in `.pai/tasks/todo.md`.

## Verification Evidence
- Spawned id
- Terminal child status
- Collected stdout/stderr summary
- Parent synthesis commit in shadow artifacts
