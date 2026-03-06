# Learning: Torq Layout & JS Execution Failure (2026-03-06)

## Problem
The `/torq/` tailored page appeared "broken" or "empty" after synchronization. Specifically, the top section stacked vertically, and the new project cards never appeared.

## Root Cause
Two unique structural drifts were found in `torq/index.html`:
1.  **Missing flex container**: It was missing `<div class="hero-wrapper">` which broke the CSS flexbox layout.
2.  **Missing Dependency**: It was missing the `Chart.js` CDN import in the `<head>`. 
    - **Compound Effect**: When `app.js` tried to render the calendar, it threw a fatal `Chart is not defined` exception. This crashed the rest of the script, preventing the `fetch('./project-details.json')` logic from ever running.

## Resolution
1.  Injected `.hero-wrapper` around the hero content.
2.  Injected `Chart.js` into the `<head>`.
3.  Updated the `app.js` path to correctly point back to the root (`../app.js`).

## Pattern/Gotcha
Tailored HTML files are prone to "structural rot" compared to the root. Automated synchronization scripts (`sync_cards.js`) only fix the grid content, not the surrounding shell/head.
**Requirement**: Add a `qa_gate` check for library dependencies in all sub-pages.
