# ADR: Innovation Grid Synchronization (2026-03-06)

## Status
Accepted

## Context
Maintaining consistent project card content (e.g., "IDE-Agnostic Agent Orchestrator", "Autonomous Trading V4.1") across 30+ tailored portfolio subdirectories was manual and error-prone. The `innovation-grid` HTML block in the root `index.html` is the source of truth, but sub-pages often diverged.

## Decision
Created `scripts/sync_cards.js` to automate the propagation of the `innovation-grid` element. 
- **Mechanism**: Extracts the outerHTML of the `.innovation-grid` from the root `index.html`.
- **Scope**: Recursively walks subdirectories, identifies `index.html` files, and replaces their `.innovation-grid` with the root's version.
- **Safety**: Excludes `node_modules`, `.git`, and `.pai`. 

## Consequences
- **Positive**: Instant consistency across all job-tailored pages.
- **Negative**: Manual overrides inside a sub-page's `innovation-grid` will now be overwritten by the root version. Customizations should henceforth live in `project-details.json` (dynamic via JS) rather than the raw HTML grid.
