# Antigravity Pilot Runbook (Portfolio-Fetch -> Moltbot -> Agentic-Memory-Scaling)

## Objective
Validate the portable PAI core in `Portfolio-Fetch` under real Antigravity usage before extending to `moltbot` and `agentic-memory-scaling`.

Reference:
- Native artifact reliability canonical guide: `portable-pai-core/docs/native-artifact-reliability.md`

## Promotion Path
1. Pilot in `Portfolio-Fetch` (current repo)
2. Expand to `moltbot`
3. Expand to `agentic-memory-scaling`
4. Global rollout

## Pilot Scope (Portfolio-Fetch)
- Runtime safety: SHADOW default + proposal-only child lanes.
- Structured policy enforcement before spawn.
- Event stream generation for auditing.
- Telemetry + quality gate behavior.
- Stale job reconciliation safety.

## Preflight (Run Once)
```bash
scripts/pai_runtime_guard.sh status
scripts/pai_native_artifact_bridge.sh ensure
scripts/pai_native_artifact_bridge.sh status
bash scripts/pai_reconcile_jobs.sh
bash scripts/pai_reconcile_jobs.sh --apply   # only if dry-run output is expected
scripts/pai_subagent_ctl.sh list
```

## KPI Windowing (for Pilot Fairness)
- Default mode uses rolling window from `.pai/config/runtime.env`:
  - `PAI_KPI_WINDOW_MODE=rolling`
  - `PAI_KPI_WINDOW_SIZE=20`
  - `PAI_KPI_INCLUDE_RECONCILED=0`
- This prevents stale reconciled migration artifacts from distorting pilot quality results.

## Antigravity Operational Trial (3-5 Sessions)
For each session in Antigravity:
1. Start in SHADOW mode.
2. Execute at least 1 read/research child spawn in `proposal_only`.
3. Attempt 1 policy-forbidden child command and confirm DENY.
4. Complete parent synthesis without child writes to orchestration artifacts.
5. Generate telemetry + quality gate report.
6. Confirm bridge heartbeat events are present for native artifacts.

Suggested commands:
```bash
scripts/pai_runtime_guard.sh status
scripts/pai_native_artifact_bridge.sh ensure
scripts/pai_subagent_ctl.sh spawn pilot_read -- "echo pilot-read && rg -n 'PAI|subagent' scripts .pai -S"
scripts/pai_policy_eval.py --policy .pai/config/policy.json --mode proposal_only --actor child --command "touch /tmp/blocked" --root .
scripts/pai_telemetry_report.sh
scripts/pai_quality_gate_eval.sh
```

## Pilot Acceptance Criteria (Go/No-Go)
- A1: No child writes to `.pai/tasks/todo.md`, `.pai/plans/active_plan.md`, `.pai/walkthrough-final.md`.
- A2: Policy deny checks work consistently for mutating commands in `proposal_only`.
- A3: Event log records spawn, policy outcomes, telemetry, gate outcomes.
- A4: No unreconciled stale running jobs after each session.
- A5: Quality gate behavior is explainable and matches KPI state (pass or fail for valid reason).

## Audit Artifacts to Capture
- `.pai/events/events.jsonl`
- `.pai/state/telemetry_report.json`
- `.pai/state/telemetry_report.md`
- `.pai/state/execution_log.jsonl`
- `.pai/runtime/subagents/events.log`

## Promotion Checklist to Moltbot
Promote only if Portfolio-Fetch passes A1-A5 for at least 3 sessions.

On `moltbot`:
1. Bootstrap `.pai/config/runtime.env` + `.pai/config/policy.json`.
2. Add script wrappers.
3. Run same 3-session trial.

## Promotion Checklist to Agentic-Memory-Scaling
Promote only if Moltbot passes A1-A5 for at least 3 sessions.

On `agentic-memory-scaling`:
1. Bootstrap config and wrappers.
2. Re-run trial with repo-specific workloads.

## Global Rollout Gate
Proceed only after all three repos pass with:
- No policy bypasses observed.
- Stable reconciliation behavior.
- No regression in quality/security constraints.

## Notes
- Quality gate can fail legitimately if historical KPI window includes previous timed-out jobs.
- For rollout decisions, use consistent KPI windowing policy (lifetime vs rolling window) across all target repos.
