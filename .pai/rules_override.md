# Portfolio-Fetch Local Rules (v3.2.0 - Robust Agentic Orchestration)

### 1. Style Guidelines
- Maintain project-specific CSS standards in `style.css`.
- Ensure all pages import the project-standard CSS.

### 2. Workflow Orchestration `#infra` `#stability`
#### Plan Mode Default
- Enter plan mode for any non-trivial task (3+ steps or architectural choices).
- If verification fails or native tools stall, stop and re-plan before continuing.
- Write implementation specs before build changes.

#### Subagent Strategy (Controlled)
- Use subagents for research and analysis only when they do not mutate native artifacts.
- Keep native artifact writes on a single execution path (no concurrent mutation lanes).

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
- **Native Profile (Preferred)**: Use native sidebars under Turn Quarantine.
- **Runtime Guard Source of Truth**: `scripts/pai_runtime_guard.sh status` + `.pai/runtime/profile.env`.
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

### 4. Task Management Contract
- Plan first in `.pai/tasks/todo.md` with checkable items.
- Track progress continuously and mark completion only after verification.
- Capture outcome summary in `.pai/walkthrough-final.md`.
