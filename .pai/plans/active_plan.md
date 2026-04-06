# Active Plan: Crunchyroll Tailored Portfolio - Integration & Stats Sync

Recover from rebase divergence while ensuring the Crunchyroll portfolio is integrated with the automated 535-commit GitHub stats infrastructure.

## User Review Required

> [!IMPORTANT]
> **535 Commit Parity**: We are prioritizing the remote version of `data.json` (535 commits) as the source-of-truth. Local 533-commit overrides will be discarded for statistical accuracy.

> [!CAUTION]
> **Merge Conflict Strategy**: I will perform a manual merge of `project-details.json` to ensure new directory registrations (`crunchyroll/`, `motive/`) are not lost during the rebase over remote updates.

## Proposed Changes

### [Integration]

#### [MODIFY] [fetch/data.json](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/fetch/data.json)
- Restore from remote `HEAD` during rebase to resolve corruption/syntax errors.

### [Portfolios]

#### [NEW] [crunchyroll/data.json](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/crunchyroll/data.json)
- Generate initial sync via propagation script.

## Open Questions

- None.

## Verification Plan

### Automated Tests
- `grep \"totalCommits\" */data.json` to confirm 535 parity across all page directories.
- `git status` to confirm clean branch and sync with origin.
