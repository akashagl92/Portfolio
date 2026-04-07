# Implementation Plan: Git Parity & Automation Verification

This plan ensures the local codebase is synchronized with the remote repository and verifies that the new Sprinklr page will receive daily automated contribution statistics.

## User Review Required

> [!IMPORTANT]
> **Automation Parity**: The existing GitHub Action (`update-stats.yml`) automatically propagates `data.json` and `project-details.json` to all top-level directories. I will align the Sprinklr page with this mechanism by ensuring it looks for its data in the local folder, allowing the daily automation to work without further changes to the Action.

## Proposed Changes

### 1. Parity Synchronization
#### [RUN] Git Parity Routine
- Execute `git stash`
- Execute `git pull --rebase origin main`
- Execute `git stash pop`
- Resolve any minor conflicts in `data.json` if necessary (favoring remote stats).

### 2. Sprinklr Automation Alignment
#### [MODIFY] [sprinklr/app.js](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/sprinklr/app.js)
- Revert the data fetch path from `../data.json` to `data.json`.
- This ensures the page reads the specific copy provided daily by the GitHub Action's `find ... -exec cp ... {}/data.json` command.

### 3. Re-Sync Verification
#### [RUN] `python3 fetch/fetch_contributions.py`
- Run the core fetch script locally to verify that the environment and PAT are correctly configured to update `data.json`.

## Verification Plan

### Automated Verification
- `grep "data.json" sprinklr/app.js` - Confirm local path reference.
- `git status` - Confirm "Your branch is up to date with 'origin/main'".

### Manual Verification
- Refresh `http://localhost:8080/sprinklr/` and verify that the "Engineering Velocity" section still renders with valid commit/repo counts.
