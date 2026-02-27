# Repository Hygiene & CI Update

Cleaning up operational systemic files that were accidentally tracked, and ensuring the new Abnormal Security portfolio is included in the automated stats update.

## User Review Required

> [!IMPORTANT]
> I am removing `scripts/pai_*` and `.pai/runtime/` from Git tracking. These will remain on your local machine and continue to work in this IDE, but they will no longer be visible on GitHub. This resolves the build failure and protects operational internals.

## Proposed Changes

### Repository Configuration

#### [MODIFY] [.gitignore](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/.gitignore)
- Add PAI operational scripts and local data directories to ignore list.

#### [MODIFY] [.github/workflows/update-stats.yml](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/.github/workflows/update-stats.yml)
- Add `abnormal/data.json` to the "Propagate Data" and "Commit" steps to ensure it stays updated.

### Cleaning Git Index

#### [TERMINAL]
- Run `git rm -r --cached .pai/runtime/ .pai/state/ scripts/reports/ scripts/pai_runtime_guard.sh scripts/pai_subagent_ctl.sh scripts/pai_subagent_worker.sh scripts/summary_cache.json`

## Verification Plan

### Automated Tests
- Run `ls -la scripts/pai_runtime_guard.sh` locally to ensure the symlink/file is still present.
- Push to GitHub and verify "Update Portfolio Stats" workflow passes and includes `abnormal/`.
- Verify [GitHub Actions](https://github.com/akashagl92/Portfolio/actions) status.

### Manual Verification
- Check the `abnormal/data.json` on GitHub after the first scheduled or manual run.
