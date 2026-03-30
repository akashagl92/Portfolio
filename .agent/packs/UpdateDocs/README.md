# PAI Pack: UpdateDocs

## Overview
Automates the refresh of project documentation, including the primary `README.md`, contribution guides, and stats dashboards.

## 7-Phase Algorithm Mapping
- **OBSERVE**: Audit documentation for stale metrics or broken links.
- **THINK**: Verify GitHub API token status.
- **PLAN**: Identify which doc sections need updates.
- **BUILD**: Fetch fresh stats from GitHub.
- **EXECUTE**: Run `update-readme.js` and `sync-calendars.py`.
- **VERIFY**: Peer-review generated markdown.
- **LEARN**: Update documentation versioning.

## Installation
`Install the UpdateDocs pack from .agent/packs/UpdateDocs/`
