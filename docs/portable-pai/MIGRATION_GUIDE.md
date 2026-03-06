# Migration Guide: Current PAI -> Portable PAI Core

## What Changed
- Added a canonical runtime config at `.pai/config/runtime.env`.
- Added structured policy at `.pai/config/policy.json`.
- Added event bus logging to `.pai/events/events.jsonl`.
- Updated runtime scripts to prefer structured policy and core runtime library.

## Backward Compatibility
- Existing script entry points remain unchanged.
- If `pai_policy_eval.py` is unavailable, `pai_subagent_ctl.sh` falls back to legacy rule checks.
- Legacy mode `research_only` is still accepted and normalized to `proposal_only`.

## Recommended Validation
1. `scripts/pai_runtime_guard.sh status`
2. `scripts/pai_subagent_ctl.sh list`
3. `scripts/pai_telemetry_report.sh`
4. `scripts/pai_quality_gate_eval.sh`
5. Validate event stream exists: `.pai/events/events.jsonl`
6. Reconcile stale jobs (if needed): `scripts/pai_reconcile_jobs.sh --apply`

## Stale Job Reconciliation
- Utility: `scripts/pai_reconcile_jobs.sh`
- Default mode is dry-run.
- Applies timestamp/heartbeat rules to `running|spawning` jobs.
- Safe apply path:
  1. `scripts/pai_reconcile_jobs.sh`
  2. `scripts/pai_reconcile_jobs.sh --apply`
  3. `scripts/pai_subagent_ctl.sh list`

## Rollback Plan
- Revert changed scripts only:
  - `scripts/pai_subagent_ctl.sh`
  - `scripts/pai_subagent_worker.sh`
  - `scripts/pai_runtime_guard.sh`
  - `scripts/pai_telemetry_report.sh`
  - `scripts/pai_quality_gate_eval.sh`
- Leave new files in place for optional future adoption.
