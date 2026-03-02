# Portfolio-Fetch: Project Manifest

## North Star Goal
To build a "living" engineering portfolio that dynamically updates itself using GitHub Actions and provides a rich, interactive user experience for visitors (and recruiters), showcasing not just code but "Agentic" workflows.

## Current State
- **Core Site:** Operational (HTML/JS/CSS).
- **Architecture Resiliency (2026-03-02 fixes):** Resolved race conditions between active orchestration pushes and automated GitHub Action background syncs by decoupling CI triggers. Enabled offline LLM caching (via JSON injection) for dynamic README project summaries to mitigate rate limits and preserve architecture.
- **Responsiveness (2026-02-25 fixes):** Resolved horizontal overflow and asymmetric padding on mobile viewports. Unified `min(350px, 100%)` grid sizing, `body` max-width fixes, and `clip-path` glow containment rolled out to all 19 portfolio pages (root, fetch, ambience, circle, scopely, stellantis, viant).
- **Automation:** GitHub Actions for fetching stats (`update-stats.yml`) are fully functional with specific repository filtering logic.
- **Research Cards:**
    - "Infinite Memory" card updated to 2026-02-25 hardened metrics.
    - "Personal AI Infrastructure (PAI v2)" card deployed across 19 pages.
- **Features:**
    - "Stats Dashboard" (Live - accurate filtered contributions)
    - "Music Visualizer" (WIP)
    - "Journal Paper" (Drafting)
    - "Tailored Portfolios" (EY-Parthenon, Scopely, Alivo, Fetch, etc.)
    - "Persona-Driven Narratives" (Live - automated career storytelling via .pai/personas/)

## Desired State
- **Fully Autonomous:** The portfolio updates its own stats, blog, and "recent work" without manual intervention.
- **Verified Accuracy:** "Repositories" count and contribution graphs match GitHub exactly.
- **Rich Media:** Seamless integration of audio visualizations and interactive demos.

## Strategic Principles
1.  **Automation First:** If it can be a script, it shouldn't be a manual task.
2.  **Verify Everything:** Trust but verify metrics (e.g., Repo Counts) against the raw API.
3.  **Aesthetics Matter:** The design must "wow" users immediately (Dark mode, glassmorphism).

## Domain Tags
`#javascript` `#scraping` `#infra` `#universal` `#research`

## Rule Version
`v2.1.0`
