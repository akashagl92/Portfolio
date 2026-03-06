# Portable PAI Core Architecture

## Layered Model

1. Core Runtime (IDE-agnostic)
- `scripts/pai_core_lib.sh`: root resolution, runtime defaults, canonical mode mapping.
- `.pai/config/runtime.env`: canonical config surface.

2. Policy Plane (IDE-agnostic)
- `.pai/config/policy.json`: declarative safety policy.
- `scripts/pai_policy_eval.py`: structured policy decisions.

3. Execution Plane
- `scripts/pai_subagent_ctl.sh`: spawn/status/list/collect/cancel.
- `scripts/pai_subagent_worker.sh`: isolated execution with timeout/cancel handling.

4. Quality Plane
- `scripts/pai_telemetry_report.sh`: KPI and sigma calculations.
- `scripts/pai_quality_gate_eval.sh`: pass/fail enforcement.

5. Event Plane (adapter-ready)
- `scripts/pai_event_bus.sh`: writes normalized event records to `.pai/events/events.jsonl`.

## Canonical Modes
- `single_parent`: no spawn.
- `proposal_only`: research/proposal only, no mutation.
- `scoped_write`: bounded write mode with policy/stage checks.

Legacy mapping:
- `research_only` => `proposal_only`

## IDE/CLI Adaptation Strategy
- Keep all core decisions in files and scripts above.
- Add IDE adapters that subscribe to event records and/or call `pai_event_bus.sh emit`.
- Use adapter-specific capabilities only as optional acceleration (status panel, notifications, hooks).
