# Learning: Concurrent Artifact UI Deadlocks (2026-02-22)

## Description
Persistent "Editing" spinners in the IDE UI were found to be caused by the concurrent execution of PAI-instrumented tool calls.

## Root Cause Analysis
- **Observed Pattern**: Deadlocks occur when `task_boundary` is called in the same turn or immediate proximity to `write_to_file` for `task.md` or `implementation_plan.md`.
- **System Behavior**: Standalone file writes to non-artifact files (`deadlock_test.txt`) succeed immediately. 
- **Trigger**: The IDE's "Progress View" and "Artifact Review" UI components hit a race condition when multiple state-mutating events are fired for the same PAI session in a single turn.

## Resolution / Mitigation
- **Avoid Turn-Isolation Rules**: Artificial turn gaps (Turn N+1) do not solve the underlying UI-thread lock.
- **Isolate Artifact Mutations**: Perform `task_boundary` updates in separate turns from `task.md` writes when the UI is unstable.
- **Window Reload**: A window reload is often necessary to clear the "zombie" lock from the IDE's UI thread.
- **Factory Reset**: If the UI persists in a locked state, strip all orchestration rules and artifacts, then reload.

## Confirmation
- STANDALONE regular file writes are verified stable.
- The deadlock is purely a UI synchronization issue, not a logic or orchestration rule issue.
