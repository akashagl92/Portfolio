---
description: Run the Recursive Gated Consolidation (RGC) sync for the IDE.
---
# RGC Sync Ritual (Global)

Run this to consolidate high-value architectural and strategic signals into the persistent project state.

> [!IMPORTANT]
> **Runtime Preflight:** This workflow requires a PAI-ready project with a `.pai/` directory.

## Steps

### 1. L0 Sentinel (The Gate)
// turbo
Run `python3 ~/.gemini/scripts/rgc/ide_sentinel.py`. This scans for ADRs, Manifest changes, and Learnings.

### 2. L1 Synthesizer (The Synthesizer)
// turbo
Run `python3 ~/.gemini/scripts/rgc/ide_synthesizer.py`. This aggregates the gated signals into a versioned Project Map in `.pai/state/context_summaries.json`.

### 3. Verify State
- Check `.pai/state/context_summaries.json` for the high-fidelity grounding.
- Verify that no data from other projects has leaked into the current project summary.
