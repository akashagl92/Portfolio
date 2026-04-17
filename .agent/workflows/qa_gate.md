---
description: Run stage-aware QA gates using detected or overridden stage type
---
# QA Gate Workflow (Stage-Aware)

Use this before finalizing implementation decisions or moving toward merge/deploy.

## When To Run
- After core implementation is complete.
- Before parent synthesis marks major tasks done.
- Before merge or deployment-related actions.

## Stage Detection
1. Detect stage:
   - `scripts/pai_stage_detect.sh`
2. Optional manual override:
   - `PAI_STAGE_OVERRIDE=dev|pre_merge|pre_deploy|post_deploy`
   - or `scripts/pai_stage_detect.sh --stage <value>`
3. Record detector output in `.pai/tasks/todo.md`.

## Stage Gates

### `dev`
- Required:
  - Global Quality Audit: `scripts/pai_skill_ctl.sh run quality-gate`
  - Runtime Telemetry Audit: `scripts/pai_telemetry_report.sh`
    - Review `spawn_success_rate_pct`, `deadlock_rate`, `fallback_logged_all_failures`.
  - Six Sigma Gate Eval: `scripts/pai_quality_gate_eval.sh`
  - lint/static checks (if configured)
  - unit/sanity checks relevant to touched scope
- Output token:
  - `QA_GATE_DEV_PASS` or `QA_GATE_DEV_FAIL`

### `pre_merge`
- Required:
  - regression check for changed paths
  - integration/smoke checks for impacted flows
  - Runtime Telemetry Audit: `scripts/pai_telemetry_report.sh`
  - Six Sigma Gate Eval: `scripts/pai_quality_gate_eval.sh`
  - verifier review summary
- Output token:
  - `QA_GATE_PRE_MERGE_PASS` or `QA_GATE_PRE_MERGE_FAIL`

### `pre_deploy`
- Required:
  - critical path smoke checks
  - rollback readiness checklist
  - Runtime Telemetry Audit: `scripts/pai_telemetry_report.sh`
  - Six Sigma Gate Eval: `scripts/pai_quality_gate_eval.sh`
  - reliability go/no-go
- Output token:
  - `QA_GATE_PRE_DEPLOY_PASS` or `QA_GATE_PRE_DEPLOY_FAIL`

### `post_deploy`
- Required:
  - monitoring sanity review
  - error/incident scan and rollback trigger review
  - Runtime Telemetry Audit: `scripts/pai_telemetry_report.sh`
  - Six Sigma Gate Eval: `scripts/pai_quality_gate_eval.sh`
- Output token:
  - `QA_GATE_POST_DEPLOY_PASS` or `QA_GATE_POST_DEPLOY_FAIL`

## Rules
- If any required gate fails, do not mark task complete.
- For SHADOW profile, write outcomes only to:
  - `.pai/tasks/todo.md`
  - `.pai/plans/active_plan.md`
  - `.pai/walkthrough-final.md`
