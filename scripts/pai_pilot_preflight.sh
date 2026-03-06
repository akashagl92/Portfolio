#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"

echo "== Pilot Preflight =="
echo "root=$ROOT_DIR"

scripts/pai_runtime_guard.sh status | sed -n '1,14p'

echo "\n-- native artifact bridge --"
scripts/pai_native_artifact_bridge.sh ensure
scripts/pai_native_artifact_bridge.sh status

echo "\n-- shadow hard banner --"
scripts/pai_shadow_hard_banner.sh

echo "\n-- config doctor --"
scripts/pai_config_doctor.sh || true

echo "\n-- stale reconcile (dry-run) --"
bash scripts/pai_reconcile_jobs.sh

echo "\n-- subagent list --"
scripts/pai_subagent_ctl.sh list || true

echo "\n-- policy allow/deny smoke --"
if scripts/pai_policy_eval.py --policy .pai/config/policy.json --mode proposal_only --actor child --command "echo ok" --root .; then
  echo "policy_allow=PASS"
else
  echo "policy_allow=FAIL"
fi
if scripts/pai_policy_eval.py --policy .pai/config/policy.json --mode proposal_only --actor child --command "touch /tmp/pilot_block" --root .; then
  echo "policy_deny=FAIL"
else
  echo "policy_deny=PASS"
fi

echo "\n-- telemetry + quality gate --"
scripts/pai_telemetry_report.sh >/dev/null
if scripts/pai_quality_gate_eval.sh; then
  echo "quality_gate=PASS"
else
  echo "quality_gate=FAIL"
fi

echo "\n-- latest events --"
tail -n 12 .pai/events/events.jsonl 2>/dev/null || true
