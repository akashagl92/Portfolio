---
description: Verify native artifact stability, then select runtime profile (NATIVE or SHADOW)
---
# Workflow: Native Verify and Runtime Switch (Fail-Fast)

## Purpose
Run a deterministic verification sequence for native artifacts. On any stall/cancel/deadlock, immediately lock SHADOW and stop native retries.

## Global Rules
- Before each step, run `scripts/pai_runtime_guard.sh status`.
- If status returns `PROFILE=SHADOW` or `LOCKED=1`, skip native writes and continue in `.pai/*`.
- Any canceled/stalled native edit is a hard failure for this run.

## Steps
1. **Plan-only native write**
- Mutate only native implementation plan artifact.
- Return token `STEP_1_DONE`.

2. **Task-only native write**
- Mutate only native task artifact.
- Return token `STEP_2_DONE`.

3. **Notify-only turn**
- No artifact mutation.
- Return token `STEP_3_DONE`.

4. **Feedback/edit loop**
- Leave feedback on implementation plan and request a small update.
- Return token `STEP_4_DONE`.

5. **Mixed-intent decomposition**
- Request plan + task + notify in one prompt.
- Agent must decompose into isolated turns.
- Return token `STEP_5_DONE`.

## Decision
- If all tokens returned and no persistent spinner:
  - run `scripts/pai_runtime_guard.sh native-on verification_pass --force`
  - set profile `NATIVE`.
- If any step stalls/cancels/deadlocks:
  - run `scripts/pai_runtime_guard.sh shadow-on native_stall`
  - set profile `SHADOW`
  - stop native verification attempts immediately
  - continue using `.pai/tasks/todo.md` and `.pai/plans/active_plan.md`.

## Operational Notes
- Do not retry the same native artifact update in the same execution path after a failure.
- Always record result in `.pai/tasks/todo.md` and `.pai/tasks/lessons.md`.
