---
description: Run the code hygiene & refactoring ritual (The Cleanse)
---
# Refactor Ritual v3 (Isolated Subagent Execution)

Run weekly or after major technical debt discovery.

## Rules
- Parent agent owns shared orchestration state updates.
- Subagents may analyze/prepare scoped code changes only.
- Subagents must not mutate native task/plan artifacts.
- If `PROFILE=SHADOW` or `LOCKED=1`, native Task/Implementation Plan/Walkthrough mutations are forbidden.
- Under shadow, shared state updates are limited to:
  - `.pai/tasks/todo.md`
  - `.pai/plans/active_plan.md`
  - `.pai/walkthrough-final.md`
- For research phases, use `scripts/pai_subagent_ctl.sh` if runtime flags permit; otherwise run single-parent fallback.

## Steps
1. Hygiene scan (dead files/workflows, manifest prune).
2. Select one cohesive refactor target.
3. Research lane:
   - Run `scripts/pai_runtime_guard.sh status`.
   - If `SUBAGENT_ENABLED=1` and `CAPABILITY_SPAWN_SUBAGENT=1`:
     - `scripts/pai_subagent_ctl.sh spawn refactor_research -- "<research command>"`
     - Poll `scripts/pai_subagent_ctl.sh status <id>` until terminal state.
     - Import results via `scripts/pai_subagent_ctl.sh collect <id>`.
   - Else: continue single-parent and record fallback reason.
4. Parent merge and simplify.
5. Verify with tests and logs.
6. Parent updates `.pai/tasks/todo.md`, `.pai/tasks/lessons.md`, and ADRs.
