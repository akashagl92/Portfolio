# Learning: Stale Global Stats and Propagation Failures

**Date:** 2026-03-05
**Context:** During the portfolio expansion phase (e.g., adding `aifoundry` and `torq`), new tailored pages and the root homepage continued to display stale engineering velocity stats (e.g., 430 commits instead of 457).

## Trigger
The system correctly fetched new data using `fetch_contributions.py`, but the browser and sub-pages failed to reflect it despite successful GitHub Action runs.

## Root Cause
1. **Hardcoded CI Propagation:** The automated GitHub Action (`update-stats.yml`) used a statically hardcoded list of directories to copy `data.json` into. Every time a new portfolio page was created, it silently failed to receive updates because it wasn't explicitly named in the YAML.
2. **Aggressive Browser Caching:** Even after the root `data.json` was updated, the `app.js` file fetched it using a static cache key (`?v=16`), causing browsers to load the stale payload from `sessionStorage` instead of hitting the live updated JSON.

## Resolution
1. **Dynamic Discovery:** Replaced the hardcoded `cp` commands in the CI pipeline with a dynamic `find -maxdepth 1 -type d` loop that automatically discovers all valid sub-portfolios, excluding system directories.
2. **Cache Busting:** Bumped the payload version stamp in `app.js` (`v17`) to force browsers to bypass stale `sessionStorage`.
3. **Global Sync:** Triggered a manual synchronization to push the 457+ commits to all 19 targets.

## Permanent Preventative Measures
- **Never Hardcode Infrastructure Lists:** When building pipelines that operate on identical structural clones (e.g., portfolio sub-pages), always use dynamic directory discovery (`find`, globbing) instead of hardcoding lists that require manual maintenance.
- **Cache Invalidation over Caching:** When dealing with frequently changing JSON endpoints (daily stats), aggressive session storage should always be paired with an automated cache-busting mechanism to ensure fresh data delivery.
