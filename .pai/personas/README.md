# Persona Coordination Spec (Portfolio-Fetch v1)

## Purpose
Define stable persona roles and a strict parent-controlled coordination model.

## Active Personas
- `architect`
- `implementer`
- `verifier`
- `reliability`
- `research_scientist`

## Ownership Model
- Parent agent is the orchestrator and final decision owner.
- Persona lanes are scoped workers.
- Persona lanes must not write shared orchestration artifacts.

## Shared Artifacts (Parent-Only Writes)
- `.pai/plans/active_plan.md`
- `.pai/tasks/todo.md`
- `.pai/walkthrough-final.md`

## Lane Output Contract
Each persona output must include:
- `persona`
- `objective`
- `assumptions`
- `findings`
- `risks`
- `decision`
- `evidence`

## Invocation Guidance
- Use one primary persona per lane.
- Add one secondary reviewer persona only when needed.
- Trigger `research_scientist` for A/B, incrementality, causality, or hypothesis tasks.
