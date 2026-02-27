# Portfolio-Fetch Local Rules (v3.3.0 - Robust Agentic Orchestration)

### 1. Style Guidelines
- Maintain project-specific CSS standards in `style.css`.
- Ensure all pages import the project-standard CSS.

### 2. Workflow Orchestration `#infra` `#stability`
#### Plan Mode Default
- Enter plan mode for any non-trivial task (3+ steps or architectural choices).
- If verification fails or native tools stall, stop and re-plan before continuing.
- Write implementation specs before build changes.

#### Subagent Strategy (Controlled)
- Research/analysis tasks must be routed through `scripts/pai_subagent_ctl.sh` when runtime flags allow.
- Parent agent remains sole writer for shared orchestration artifacts:
  - `.pai/tasks/todo.md`
  - `.pai/plans/active_plan.md`
  - `.pai/walkthrough-final.md`
- Keep mutating writes on a single execution path (no concurrent mutation lanes).

#### Self-Improvement Loop
- After each correction, append a short lesson to `.pai/tasks/lessons.md`.
- Review lessons at session start for this project.

#### Verification Before Done
- Do not mark tasks complete without proof (tests, logs, diff checks).
- For native artifact workflows, include one explicit stability check before completion.

#### Demand Elegance (Balanced)
- For non-trivial changes, run a simplicity pass before finalizing.
- Keep scope minimal and avoid over-engineering.

#### Autonomous Bug Fixing
- When failures appear, inspect logs/errors first and resolve root cause.
- Avoid context switching until a reproducible fix or fallback is in place.

### 3. Native/Shadow Runtime Policy (IDE-Agnostic Protocol)
- **Shadow Profile (Default)**: Use `.pai/*` artifacts as source of truth.
- **Runtime Guard Source of Truth**: `scripts/pai_runtime_guard.sh status` + `.pai/runtime/profile.env`.
- **Explicit Deny (SHADOW/LOCKED)**:
  - Never mutate native `Task`.
  - Never mutate native `Implementation Plan`.
  - Never mutate native `Walkthrough`.
- **Explicit Allow (SHADOW/LOCKED)**:
  - `.pai/tasks/todo.md`
  - `.pai/plans/active_plan.md`
  - `.pai/walkthrough-final.md`
- **Turn Quarantine**:
  - one native mutation per turn,
  - no concurrent mutating tool calls,
  - notifications run in their own turn.
- **Shadow Profile (Fail-Safe)**: If any native artifact stalls, immediately route planning/task updates to:
  - `.pai/plans/active_plan.md`
  - `.pai/tasks/todo.md`
- **Autonomous Switch Rule**: On native stall/spinner/failure, execute:
  - `scripts/pai_runtime_guard.sh shadow-on native_stall`
  - then continue in `SHADOW` without asking for confirmation.
- **Recovery Rule**: Return to Native only after passing the local verification workflow.
  - `scripts/pai_runtime_guard.sh native-on verification_pass --force`

### 4. Research Routing Contract (PoC Sub-Agent Spawn)
- For research-class tasks (investigate, compare, gather references, summarize findings):
  1. Run `scripts/pai_runtime_guard.sh status`.
  2. If `SUBAGENT_ENABLED=1` and `CAPABILITY_SPAWN_SUBAGENT=1`, spawn via:
     - `scripts/pai_subagent_ctl.sh spawn <label> -- "<command>"`
  3. Track lifecycle with `status` and `collect`.
  4. Merge child outputs in parent context; child must not write shared orchestration artifacts.
  5. If spawn is gated/unavailable/fails, fallback to single-parent and record reason in `.pai/tasks/todo.md`.

### 5. Task Management Contract
- Plan first in `.pai/tasks/todo.md` with checkable items.
- Track progress continuously and mark completion only after verification.
- Capture outcome summary in `.pai/walkthrough-final.md`.
