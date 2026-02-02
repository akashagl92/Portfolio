# Portfolio-Fetch: Project Manifest

## North Star Goal
To build a "living" engineering portfolio that dynamically updates itself using GitHub Actions and provides a rich, interactive user experience for visitors (and recruiters), showcasing not just code but "Agentic" workflows.

## Current State
- **Core Site:** Operational (HTML/JS/CSS).
- **Responsiveness:** Fixed - Calendar grid and project cards work correctly at all viewport widths (desktop, tablet, mobile). All 16 portfolio pages use unified root `style.css`.
- **Automation:** GitHub Actions for fetching stats (`update-stats.yml`) are largely functional but prone to occasional "stale data" or "permission" bugs.
- **Features:**
    - "Stats Dashboard" (Live - shows accurate author-filtered contributions)
    - "Music Visualizer" (WIP)
    - "Journal Paper" (Drafting)


## Desired State
- **Fully Autonomous:** The portfolio updates its own stats, blog, and "recent work" without manual intervention.
- **Verified Accuracy:** "Repositories" count and contribution graphs match GitHub exactly.
- **Rich Media:** Seamless integration of audio visualizations and interactive demos.

## Strategic Principles
1.  **Automation First:** If it can be a script, it shouldn't be a manual task.
2.  **Verify Everything:** Trust but verify metrics (e.g., Repo Counts) against the raw API.
3.  **Aesthetics Matter:** The design must "wow" users immediately (Dark mode, glassmorphism).
