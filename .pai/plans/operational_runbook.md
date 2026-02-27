# Operational Runbook: Main-Agent and Sub-Agent Collaboration (Portfolio-Fetch)

## Purpose
Operational guide for safe execution using SHADOW-first orchestration and controlled sub-agent spawning.

## 1) Runtime Profile Flags (`.pai/runtime/profile.env`)

### Core Profile
- `PROFILE=SHADOW|NATIVE`
  - `SHADOW` (recommended default): deny native Task/Implementation Plan/Walkthrough mutation.
  - `NATIVE` (exception): use only after explicit native verification.
- `LOCKED=1|0`
  - `1`: enforce strict shadow safety policy.
  - `0`: allow profile transitions.

### Sub-Agent Controls
- `SUBAGENT_ENABLED=1|0`
  - `1`: allow spawn path (subject to capability/mode).
  - `0`: force single-parent mode.
- `SUBAGENT_MODE=single_parent|proposal_only|scoped_write`
  - `single_parent`: no spawning.
  - `proposal_only` (recommended default): sub-agents analyze/propose; no mutation commands.
  - `scoped_write` (exception): allowed only with explicit scope locks and reviewer approval.
- `SUBAGENT_MAX_CONCURRENCY=<int>`
  - Hard cap of simultaneous lanes.
- `SUBAGENT_TIMEOUT_SEC=<int>`
  - Child timeout in seconds.
- `CAPABILITY_SPAWN_SUBAGENT=1|0`
  - `1`: local spawn controller enabled.
  - `0`: spawn unavailable; fallback to single-parent.

## 2) Recommended Defaults
- `PROFILE=SHADOW`
- `LOCKED=1`
- `SUBAGENT_ENABLED=1`
- `SUBAGENT_MODE=proposal_only`
- `SUBAGENT_MAX_CONCURRENCY=2`
- `SUBAGENT_TIMEOUT_SEC=180`

## 3) Workflow Selection Guide
- `/session_bootstrap`
  - Run first in every new/reloaded session.
- `/persona_orchestration`
  - Use for non-trivial delivery tasks requiring persona coordination.
- `/research_spawn`
  - Use for heavy research and evidence-backed analysis.
- `/pai_sync`
  - Use at day-end/context-switch for persistence and cleanup.
- `/native_verify_and_switch`
  - Use only for explicit native exception testing.

## 4) Stage-Based Quality Gates

### Stage Detection (Operational)
- Auto-detect stage:
  - `scripts/pai_stage_detect.sh`
- Manual override (recommended when detector confidence is low):
  - `PAI_STAGE_OVERRIDE=dev|pre_merge|pre_deploy|post_deploy`
  - or `scripts/pai_stage_detect.sh --stage <value>`
- Detector emits:
  - `STAGE=<...>`
  - `CONFIDENCE=<low|medium|high>`
  - `REASON=<signal summary>`

### Build/Dev Stage
- Owner: `verifier`
- Required: lint + unit tests + sanity checks.

### Pre-Merge Stage
- Owners: `verifier` + `reliability`
- Required: integration/smoke checks + regression scan + safety review.

### Pre-Deploy Stage
- Owners: `verifier` + `reliability` (+ `research_scientist` if experiment-driven release)
- Required: critical path smoke + rollback readiness.

### Post-Deploy Stage
- Owner: `reliability`
- Required: canary health and incident watch.

## 5) Parent vs Child Write Rights
- Parent-only writes:
  - `.pai/tasks/todo.md`
  - `.pai/plans/active_plan.md`
  - `.pai/walkthrough-final.md`
- Child lanes:
  - Must not mutate shared orchestration artifacts.
  - In `proposal_only`, must not run mutation commands.

## 6) Failure and Fallback
- On spawn failure/timeout:
  1. Log fallback in `.pai/tasks/todo.md`.
  2. Continue in single-parent mode.
- On native drift under shadow:
  1. Deny native mutation action.
  2. Continue with SHADOW allowlist targets only.

## 7) KPI Targets
- `spawn_success_rate >= 95%`
- `deadlock_rate = 0` on shared artifacts
- fallback logged on every spawn failure
- zero child writes to shared orchestration targets
