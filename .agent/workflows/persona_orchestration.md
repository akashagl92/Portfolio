---
description: Execute a task with parent-led Outer Loop and sub-agent Inner Loop handoffs
---
# Persona Orchestration Workflow (Loop-Aligned)

Use this workflow for non-trivial tasks that require persona collaboration.

## When To Run
- Any task with 3+ implementation steps.
- Tasks with cross-domain impact (architecture + UX + reliability).
- Work that needs explicit persona handoffs and parent review gates.
- Before deployment-affecting changes that require verification discipline.

## 0. Runtime Preflight
1. Run `scripts/pai_runtime_guard.sh status`.
2. Run `scripts/pai_shadow_hard_banner.sh`.
3. If `NATIVE_ARTIFACTS_ALLOWED=1`, main-lane native artifacts are allowed.
4. If `PROFILE=SHADOW` or `LOCKED=1`, use only:
   - `.pai/tasks/todo.md`
   - `.pai/plans/active_plan.md`
   - `.pai/walkthrough-final.md`
5. Never mutate native Task/Implementation Plan/Walkthrough under SHADOW/LOCKED.
6. Hard deny under SHADOW/LOCKED:
   - `task_boundary`
   - native edits to `task.md`, `implementation_plan.md`, `walkthrough.md`
7. Mandatory rule text:
   - `If NATIVE_ARTIFACTS_ALLOWED=0, ban task_boundary + native task.md/implementation_plan.md/walkthrough.md edits, use .pai/* only.`

## 1. Parent Outer Loop (Strategy)
1. Define objective, constraints, and success criteria.
2. Choose persona routing:
   - `architect`
   - `implementer`
   - `verifier`
   - `reliability`
   - `research_scientist` (for A/B, causality, incrementality, hypothesis tasks)
3. Decide lane type:
   - quick bounded work => main lane,
   - heavy/multi-source/high-context => sub-agent spawn lane.

## 2. Sub-Agent Inner Loop (Scoped Execution)
1. Spawn scoped lane if required:
   - `scripts/pai_subagent_ctl.sh spawn <label> -- "<command>"`
2. Require handoff schema:
   - `persona`
   - `objective`
   - `assumptions`
   - `findings`
   - `risks`
   - `decision`
   - `evidence`
   - `inner_loop_trace`
   - `confidence`
3. Collect lifecycle evidence:
   - `scripts/pai_subagent_ctl.sh status <id>`
   - `scripts/pai_subagent_ctl.sh collect <id>`

## 3. Parent Review Gate (Mandatory)
1. Validate handoff quality and policy compliance.
2. Resolve inter-persona conflicts.
3. Accept/reject each handoff with rationale.
4. On rejection, re-scope and re-run that lane only.

## 4. Parent Synthesis (Shared Writes)
1. Update `.pai/plans/active_plan.md` with accepted decisions.
2. Update `.pai/tasks/todo.md` with execution checklist.
3. Update `.pai/walkthrough-final.md` with outcome and verification.

## 5. Verify and Learn
1. Run verification checks (tests/logs as relevant).
2. Run stage-aware QA gate:
   - `/qa_gate`
3. Capture lesson in `.pai/tasks/lessons.md`.
4. Return summary with:
   - accepted personas,
   - rejected personas (if any),
   - final decision and evidence.
