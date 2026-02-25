# Learning: GitHub Actions Identity & Case-Sensitivity patterns

## Context
We encountered a CI failure in the `update-stats` workflow and a bug in the repository filtering logic.

## Analysis
1.  **CI Failure:** The workflow attempted to commit changes but failed with `Author identity unknown`. The script only configured `user.email` but not `user.name`. Git requires both to create a commit.
2.  **Filtering Bug:** Initial repository filtering failed because the hardcoded exclusion list (`Marketing-analytics-assistant`) did not match the actual repository name casing returned by the API (`Marketing-Analytics-Assistant`) or variations (`Marketing-Analytics-Assistant1`).

## Learnings
1.  **Explicit Identity:** Always configure both `git config user.name` and `git config user.email` in GitHub Actions workflows that perform commits.
    ```yaml
    - run: |
        git config --global user.email 'actions@github.com'
        git config --global user.name 'GitHub Actions'
    ```
2.  **Defensive String Matching:** When filtering or matching string identifiers (like repo names) that may vary in casing or have slight suffix variations:
    - Always normalize sources to `.lower()` before comparison.
    - Use `keyword in name.lower()` for broad matching rather than strict equality if appropriate.

## Action Items
- Ensure all future scripts use case-insensitive matching for configuration exclusions.
- Check other workflows for missing git identity configuration.
