# PAI Six Sigma Quality Control

## Purpose
Define measurable quality control for parent/sub-agent execution using DMAIC and stage gates.

## Core KPIs
- `spawn_success_rate_pct`
- `deadlock_rate`
- `fallback_logged_all_failures`
- `defects_current_stage`
- `dpo_current_stage`
- `dpmo_current_stage`
- `sigma_level_current_stage`

## Targets
- `spawn_success_rate_pct >= 95`
- `deadlock_rate = 0`
- `fallback_logged_all_failures = 1`
- `sigma_level_current_stage >= 4.0`

## Scripts
- `scripts/pai_defect_log.sh`
  - Add defect:
    - `scripts/pai_defect_log.sh add --class ORCH_DEADLOCK --severity S1 --stage pre_merge --summary "native spinner on task update" --source qa_gate --owner reliability`
  - Stats:
    - `scripts/pai_defect_log.sh stats`
- `scripts/pai_telemetry_report.sh`
  - Generates:
    - `.pai/state/telemetry_report.json`
    - `.pai/state/telemetry_report.md`
- `scripts/pai_quality_gate_eval.sh`
  - Enforces pass/fail against telemetry targets.

## DPMO Model
- Opportunities are estimated per run:
  - `changed_files + stage_checks + total_spawns`
- Defects for current stage:
  - `defect_log_stage + failed_spawns + deadlock_events`
- Formulas:
  - `DPO = defects / opportunities`
  - `DPMO = DPO * 1,000,000`

## Sigma Bands (Approximate)
- `<= 3.4 DPMO => 6.0 sigma`
- `<= 233 DPMO => 5.0 sigma`
- `<= 6,210 DPMO => 4.0 sigma`
- `<= 66,807 DPMO => 3.0 sigma`
- `<= 308,537 DPMO => 2.0 sigma`
- `> 308,537 DPMO => 1.0 sigma`

## Workflow Integration
- `/qa_gate`: run telemetry + gate evaluation in every stage.
- `/pai_sync`: update telemetry, evaluate gate, and log new defects.

## Defect Classes
- `ORCH_DEADLOCK`
- `ORCH_POLICY_VIOLATION`
- `SUBAGENT_HANDOFF_DEFECT`
- `TEST_DEFECT`
- `REGRESSION_DEFECT`
- `SECURITY_SECRET_LEAK`
- `SECURITY_AUTHZ_DEFECT`
- `DEPLOYMENT_FAILURE`
- `POST_DEPLOY_INCIDENT`
