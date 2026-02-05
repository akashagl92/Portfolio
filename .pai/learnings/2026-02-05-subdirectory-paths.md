# Learning: Path Management in Sub-directory Portfolios

## Issue
When copying `index.html` and `app.js` to a sub-directory (e.g., `/ey/`), paths to assets (CSS, JSON) break if they are relative to the file.

## Root Cause
- The sub-directory `index.html` expects `style.css` in its own folder.
- `app.js` fetch calls use `./data.json`, which points to a non-existent file in the sub-directory.

## Resolution
- Update `index.html` to use `../style.css`.
- Update `app.js` to use `../data.json` and `../project-details-ai.json`.
- Ensure `data-repo` attributes are correctly placed for AI summaries to bind correctly.

## Prevention
When creating a new tailored page, always check the "Tailor Content" step in the `create_job_portfolio` workflow to verify relative pathing.
