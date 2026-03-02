# ADR-0010: Removal of Automated Push Triggers from CI Pipelines

## Status
Accepted

## Context
During active development sessions, particularly those involving autonomous agentic orchestration, frequent local commits and pushes are common. Concurrently, a GitHub Action (`update-stats.yml`) was configured to run on every `push` to the `main` branch. This CI pipeline fetched repository statistics and committed updates to a data artifact (`data.json`) directly to the remote repository.

This created a severe race condition:
1. Agent pushes local change A.
2. CI pipeline triggers remotely on change A.
3. Agent continues working locally on change B.
4. CI pipeline pushes new commit to remote `main`.
5. Agent attempts to push change B and is immediately rejected due to divergent history (Updates were rejected because the remote contains work that you do not have locally).
6. Agent is forced to perform a `git pull --rebase` and manually resolve merge conflicts on auto-generated data files in the middle of a task.

## Decision
We will cleanly decouple scheduled/maintenance data ingestion from active development pushes.
1. The `push:` trigger is permanently removed from the `.github/workflows/update-stats.yml` action.
2. The CI pipeline will strictly retain its scheduled `cron` trigger and manual `workflow_dispatch` trigger.

## Consequences
- **Positive:** Agents and developers can push continuously to the remote repository without fear of background CI pipelines simultaneously mutating the shared branch and causing disruptive merge conflicts.
- **Positive:** Reduces redundant compute execution on GitHub Actions (updating stats on every layout tweak is unnecessary).
- **Negative:** The live portfolio stats on the deployed site will only update once daily (or manually) instead of immediately after every push. This is an acceptable tradeoff for orchestration stability.
