# ADR 0007: Visual Repository Filtering & Renaming

## Context
The user wanted to exclude specific work-related repositories (`Marketing-analytics-assistant`, `linkedin-api`, `*databricks*`) from the visual "Engineering Velocity" grid on the portfolio homepage, likely to maintain a cleaner public presentation or hide internal/sensitive project names. However, the aggregated quantitative metrics ("Total Commits", "Total Repositories") needed to remain accurate to reflect true engineering volume. Additionally, the repository `aistro.ai` needed to be renamed to `AI Astrology` for better readability.

## Decision
We implemented a filtering and renaming layer within the data fetching script (`fetch/fetch_contributions.py`) that acts **only** on the daily contribution data used for the visual heatmap.

1.  **Exclusions:** A set of `EXCLUDED_REPOS` and `EXCLUDED_KEYWORDS` is checked against each repository name (case-insensitive). Matches are excluded from the `daily_commits` list.
2.  **Renaming:** A `REPO_RENAMES` map translates specific repository names (e.g., `aistro.ai` -> `AI Astrology`) before adding them to the `daily_commits` list.
3.  **Global Stats Preservation:** The `repo_data` list and `total_commits` counters are populated **before** the exclusion check, ensuring that the "big number" metrics on the dashboard remain comprehensive and truthful, even if specific item-level details are hidden.

## Consequences
- **Positive:** The portfolio visual is cleaner and aligned with user preference. Sensitive/work-related repo names are hidden from the heatmap/tooltip.
- **Positive:** Aggregated engineering velocity metrics remain accurate.
- **Negative:** There is a discrepancy between the visual grid (sum of visible squares) and the total numbers displayed above it. This is a known and accepted trade-off.
