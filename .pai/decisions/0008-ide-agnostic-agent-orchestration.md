# ADR 0008: IDE-Agnostic Agent Orchestration with Capability-Aware Serialization

Date: 2026-02-23
Status: Accepted

## Context
The current mitigation for Antigravity deadlocks is "do not use native sidebars/artifacts at all." This prevents lockups but does not generalize across IDEs and prevents using native capabilities when available.

Observed failure pattern:
- Deadlocks appear when multiple state-mutating native calls occur close together.
- UI remains stuck in editing/spinner state even when disk writes succeed.
- Restart/reload clears UI lock but does not address root scheduling behavior.

## Decision
Adopt a capability-aware orchestration model with strict sequencing guarantees and automatic fallback.

1. Tool classes
- Class A: read-only operations.
- Class B: mutating non-artifact operations.
- Class C: native artifact/UI mutation operations.

2. Scheduling policy
- Class C operations are always isolated in their own turn.
- Class B and Class C share a serialized mutation queue.
- Class A may run in parallel only when profile is not `SERIAL_ONLY`.

3. Session profile
- Probe runtime at session start and classify as `SERIAL_ONLY`, `MIXED`, or `FULL`.
- Default pessimistically to `SERIAL_ONLY` when uncertain.

4. Fallback strategy
- On lock symptoms/timeouts, open circuit breaker for native artifact channel.
- Route updates to shadow artifacts under `.pai/`.
- Preserve replay metadata for reconciliation.

5. Reconciliation
- Replay shadow state back to native artifacts only after channel health is restored.
- Replay in strict order: plan -> task -> notify.

## Consequences
Positive:
- Deadlock prevention becomes systemic instead of ad-hoc.
- Runtime is portable across IDE/model stacks.
- Native features remain usable when the environment supports them.

Trade-offs:
- Slightly slower mutation throughput in `SERIAL_ONLY` mode.
- Additional complexity in fallback/reconciliation logic.

## Guardrails
- No batching of notification-like terminal calls with mutating tool calls.
- Every mutation must have an idempotency key.
- All retries are bounded; repeated failures route to dead-letter log and shadow fallback.
