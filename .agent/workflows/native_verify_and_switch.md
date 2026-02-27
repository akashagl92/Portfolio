---
description: Run native artifact exception test; keep SHADOW default unless all checks pass
---
# Workflow: Native Exception Verification (Shadow-First)

## Purpose
Native is an exception path. Use this workflow only when explicitly testing whether native artifacts can be safely enabled.

## Global Rules
- Before each step, run `scripts/pai_runtime_guard.sh status`.
- If `PROFILE=SHADOW` or `LOCKED=1`, this workflow may proceed only as an explicit verification run.
- Any canceled/stalled native edit is a hard failure.
- Outside this explicit verification workflow, native Task/Implementation Plan/Walkthrough mutations are forbidden under SHADOW/LOCKED.

## Steps
1. Plan-only native write -> `STEP_1_DONE`
2. Task-only native write -> `STEP_2_DONE`
3. Notify-only turn -> `STEP_3_DONE`
4. Feedback/edit loop -> `STEP_4_DONE`
5. Mixed-intent decomposition -> `STEP_5_DONE`

## Decision
- Default outcome: remain `SHADOW`.
- Only if all steps pass with no persistent spinner:
  - run `scripts/pai_runtime_guard.sh native-on verification_pass --force`
  - enable `NATIVE` for the current session only.
- If any step stalls/cancels/deadlocks:
  - run `scripts/pai_runtime_guard.sh shadow-on native_stall`
  - remain `SHADOW`
  - stop native retries in this execution path.

## Notes
- Parent-only writes to shared orchestration state remain mandatory.
- Record outcome in `.pai/tasks/todo.md` and `.pai/tasks/lessons.md`.
