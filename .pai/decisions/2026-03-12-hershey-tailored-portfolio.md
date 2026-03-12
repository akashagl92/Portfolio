# ADR 2026-03-12-hershey-tailored-portfolio

## Status
Accepted (SHADOW)

## Context
The user requested a tailored portfolio page for a Senior Manager, Data Products role at Hershey. The project requires high-fidelity alignment with enterprise data governance, architecture, and productization themes.

## Decision
1. Create a dedicated `/hershey/` directory to host the tailored site.
2. Adapt `index.html` and `app.js` from the root repository but configure them to fetch global data (repositories, stats, agentic summaries) from the parent level.
3. Use relative pathing (`../data.json`, `../project-details.json`) locally within `hershey/app.js` but ensure these files are physically present in the directory for full portability.
4. Update `.github/workflows/update-stats.yml` to propagate both `data.json` and `project-details.json` to all subdirectories automatically.
5. Enforce SHADOW mode runtime policy during the implementation to ensure project hygiene and compliance with PAI v2 standards.

## Consequences
- The Hershey page will stay in sync with the root repository via automated GitHub Action propagation of both stats (`data.json`) and AI metadata (`project-details.json`).
- Localized tailoring (Hero, Badge) provides a specific narrative without duplicating data processing logic.
- SHADOW mode enforcement ensures that task tracking remains within the `.pai/` hierarchy, avoiding clutter in the native AI brain artifacts.
