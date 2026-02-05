# ADR: Tailored Portfolio Sub-directories

## Context
Recruiters and hiring managers often want to see specific relevance to their role. Standard one-size-fits-all portfolios can be less effective than targeted ones.

## Decision
Create sub-directories (e.g., `/ey/`, `/scopely/`) that contain a tailored `index.html` and `app.js`.
- `index.html` highlights relevant hero text, badges, and project cards.
- `app.js` is modified to pull data from root-level JSON files (`data.json`, `project-details-ai.json`).

## Status
Accepted / In Use

## Consequences
- **Pros**: Higher relevance for specific job applications.
- **Cons**: Maintenance overhead if root `style.css` or data structures change, as each sub-directory's `index.html` and `app.js` must be updated or stay compatible.
