# 6. Global PAI Sync Strategy

Date: 2026-01-20

## Status
Accepted

## Context
We are operating within the Antigravity IDE, which has a "Global Memory" (`~/.gemini/GEMINI.md`) and project-specific memories (`.pai/`). We need a reliable mechanism to ensure:
1.  **Compliance**: Every project adheres to the global Prime Directive.
2.  **Learning Promotion**: Valuable insights from a specific project (e.g., "React 19 breaks X") are captured globally to benefit future projects.

## Decision
We will implement a **"Read-Global, Write-Local, Promote-Manual"** strategy.

### 1. Read-Global
Every session MUST start with the `pai_sync` workflow, which reads `~/.gemini/GEMINI.md` (or the equivalent global memory file accessible to the agent). This ensures the agent is "booted" with the latest global operating system instructions.

### 2. Write-Local
The agent will primarily write to the local `.pai/learnings/` directory to capture project-specific insights. This keeps the global namespace clean and prevents project-specific noise from polluting the global rules.

### 3. Promote-Manual
To update the Global Antigravity layer, we rely on the `pai_sync` workflow's **"Global Sync"** step.
*   **Mechanism**: The agent scans local learnings and identifies candidates for promotion.
*   **Action**: The agent proposes: "Promote [Insight] to Global Rules?".
*   **Execution**: Upon user approval, the agent appends the rule to the global memory file (or asks the user to do so if permissions are restricted).

## Consequences
*   **Pros**: Prevents global rule bloat; ensures human-in-the-loop verification of global rules.
*   **Cons**: Requires manual approval step; "Global Sync" depends on the agent's ability to recognize universal value.
