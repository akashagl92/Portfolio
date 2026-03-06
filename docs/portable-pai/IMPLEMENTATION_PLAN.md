# Portable PAI Implementation Plan (Non-Breaking)

## Goals
- Preserve existing strengths: SHADOW-first safety, stage-aware quality gates, parent-owned orchestration artifacts.
- Remove operational redundancy by centralizing runtime configuration and mode vocabulary.
- Introduce portable primitives that can run in any IDE/CLI with adapter-specific optional enhancements.

## Principles
- Compatibility-first: existing commands continue to work.
- Progressive hardening: structured policy is introduced behind fallback behavior.
- Observable by default: event emissions are added without coupling to a specific IDE.

## Delivered in This Phase
1. Canonical runtime config: `.pai/config/runtime.env`
2. Structured policy rules: `.pai/config/policy.json`
3. Shared runtime library: `scripts/pai_core_lib.sh`
4. Event bus: `scripts/pai_event_bus.sh`
5. Structured policy evaluator: `scripts/pai_policy_eval.py`
6. Stale job reconciler: `scripts/pai_reconcile_jobs.sh`
7. Integrations:
   - `scripts/pai_subagent_ctl.sh`
   - `scripts/pai_subagent_worker.sh`
   - `scripts/pai_runtime_guard.sh`
   - `scripts/pai_telemetry_report.sh`
   - `scripts/pai_quality_gate_eval.sh`

## Guardrails
- Child agents remain blocked from shared orchestration files.
- `proposal_only` remains default for child lanes.
- Legacy controls remain as fallback if policy evaluator is unavailable.

## Next Phases
1. Replace shell heuristics with structured command-intent envelopes from all orchestration entry points.
2. Add adapter contracts for Claude/Codex/Cursor/OpenCode.
3. Externalize policy to organization-scoped profile packs.
4. Add CI validation for policy, mode consistency, and event schema compliance.
