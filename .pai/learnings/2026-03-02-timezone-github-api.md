# Incident: Timezone Leakage in GitHub API Dates 

## Context
The Engineering Velocity grid started showing future or extra commits (e.g., March 2nd commits showing up when it was still March 1st local time). 

## Root Cause
GitHub API returns commit timestamps in strictly UTC format. The script `scripts/fetch-github.js` was passing the UTC date string directly into simple JS `Date` logic, which aggregated the stats based on the UTC day boundary instead of the user's localized day boundary (CDT/CST). Any commits made after 6:00 PM CST were grouped into the next day.

## Resolution
Modified `scripts/fetch-github.js` to explicitly shift the UTC commit times into the `America/Chicago` timezone *before* iterating and grouping them.
```javascript
const utcDate = new Date(commit.commit.author.date);
const chicagoStr = utcDate.toLocaleString('en-US', { timeZone: 'America/Chicago' });
const chicagoDate = new Date(chicagoStr);
```
This isolates the metric aggregation entirely from UTC boundary edge cases.
