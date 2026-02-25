# IDE-Agnostic Orchestration Verification Matrix

Date: 2026-02-23
Project: Portfolio-Fetch

## Goal
Prove the orchestration model avoids deadlocks while preserving artifact/task consistency.

## Test 1: Serial Mutation Enforcement
- Setup: Profile `SERIAL_ONLY`.
- Stimulus: Request write to plan + task + notify in one user intent.
- Expected:
  - system decomposes into isolated turns,
  - no concurrent mutating calls,
  - no persistent "editing" spinner.
- Evidence: timestamps/order in execution log + final file contents.

## Test 2: Mixed Profile Parallel Read Safety
- Setup: Profile `MIXED`.
- Stimulus: parallel read-only lookups plus one state mutation request.
- Expected:
  - read-only calls may run in parallel,
  - mutation queue remains single-flight,
  - mutation completion not blocked by read fan-out.
- Evidence: log shows class A fan-out; class B/C serialized.

## Test 3: Circuit Breaker Fallback
- Setup: induce native artifact instability (rapid native updates).
- Stimulus: mutate native task artifact.
- Expected:
  - breaker opens after threshold,
  - writes reroute to `.pai/tasks/todo.md` and `.pai/plans/active_plan.md`,
  - no data loss.
- Evidence: breaker event + shadow file delta.

## Test 4: Reconciliation Replay
- Setup: breaker open with shadow deltas.
- Stimulus: recover channel and trigger sync.
- Expected:
  - replay runs as isolated sequence: plan -> task -> notify,
  - native and shadow converge.
- Evidence: content hash match between shadow source and native target.

## Test 5: Idempotent Retry
- Setup: transient failure during mutation.
- Stimulus: same call retried automatically.
- Expected:
  - one logical write (no duplicate append/duplicate task),
  - idempotency key prevents replay duplication.
- Evidence: mutation ledger shows retry attempts with single commit result.

## Test 6: Cross-IDE Portability
- Setup: run same prompt suite in Antigravity and second IDE/model.
- Stimulus: identical workflow prompts.
- Expected:
  - policy adaptation differs only by profile (`SERIAL_ONLY/MIXED/FULL`),
  - no deadlock in either runtime.
- Evidence: per-IDE run report with pass/fail and profile selected.
