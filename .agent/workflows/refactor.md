---
description: Run the code hygiene & refactoring ritual (The Cleanse)
---
# Refactor Ritual v3 (Isolated Subagent Execution)

Run weekly or after major technical debt discovery.

## Rules
- Parent agent owns shared orchestration state updates.
- Subagents may analyze/prepare scoped code changes only.
- Subagents must not mutate native task/plan artifacts.

## Steps
1. Hygiene scan (dead files/workflows, manifest prune).
2. Select one cohesive refactor target.
3. Optional subagent analysis lanes (read-heavy or scoped edits).
4. Parent merge and simplify.
5. Verify with tests and logs.
6. Parent updates `.pai/tasks/todo.md`, `.pai/tasks/lessons.md`, and ADRs.
