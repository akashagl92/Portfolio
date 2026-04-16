# Portfolio-Fetch: Project Manifest

## North Star Goal
To build a "living" engineering portfolio that dynamically updates itself using GitHub Actions and provides a rich, interactive user experience for visitors (and recruiters), showcasing not just code but "Agentic" workflows.

## Current State
- **Core Site:** Operational (HTML/JS/CSS).
- **Architecture Resiliency (2026-03-02 fixes):** Resolved race conditions between active orchestration pushes and automated GitHub Action background syncs by decoupling CI triggers. Enabled offline LLM caching (via JSON injection) for dynamic README project summaries to mitigate rate limits and preserve architecture.
- **Responsiveness (2026-02-25 fixes):** Resolved horizontal overflow and asymmetric padding on mobile viewports. Unified `min(350px, 100%)` grid sizing, `body` max-width fixes, and `clip-path` glow containment rolled out to all 19 portfolio pages (root, fetch, ambience, circle, scopely, stellantis, viant).
- **Automation:** GitHub Actions for fetching stats (`update-stats.yml`) are fully functional with specific repository filtering logic.
- **Infrastructure Sync (2026-03-06):** Unified the `innovation-grid` across all 30+ tailored portfolios using `scripts/sync_cards.js`. Fixed structural layout rot in `/torq/` (missing `.hero-wrapper` and `Chart.js` dependency) and corrected relative script paths.
- **Restoring Hero Section Alignment (2026-04-16):** Restored and hardened the center alignment for the hero fold and nav header across mobile viewports. Re-implemented March-standard centering constraints and unified responsive grid behavior after a layout regression.
- **Hygiene Ritual (2026-03-12):** Pruned legacy stylesheets (`old_style.css`, etc.) and consolidated architectural state via ADRs. Enforced PAI v2 SHADOW mode during high-velocity tailoring session.
- **Research Cards:**
    - "V4.1 Alpha Steady" trading strategy: **80.8% XIRR** (**60.3% Alpha** over S&P 500).
    - "ide-agnostic-agent-orchestrator" (Portable PAI Core): Native artifact safety and cross-IDE telemetry.
    - "Infinite Memory" card updated to 2026-03-06 hardened metrics.
- **Features:**
    - "Stats Dashboard" (Live - accurate filtered contributions)
    - "Music Visualizer" (WIP)
    - "Journal Paper" (Drafting)
    - "Tailored Portfolios" (EY-Parthenon, Scopely, Alivo, Fetch, Hershey, etc.)
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
