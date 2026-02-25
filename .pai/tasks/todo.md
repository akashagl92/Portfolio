# Todo: Portfolio Infrastructure Updates

- [x] Integrate SSC/RGC "Infinite Memory" card across 19 pages (v1)
- [x] Add PAI v2 Infrastructure card across 19 pages
- [/] **Final Refinement: Infinite Memory card with Hardened 2026-02-25 metrics**
  - [x] Review `global_learnings.md` for hardened thresholds (1M turns)
  - [x] Implement Batch 1: Root + airbnb, alivo, ambience
  - [x] Implement Batch 2: circle, consensys, ey, fedex
  - [x] Implement Batch 3: fetch, happymoney, kraken, quince
  - [x] Implement Batch 4 & 5: reku, root, scopely, stellantis, torq, viant
- [/] Final Verification
  - [x] Visual verification of O(1) and 1M turn threshold metrics
  - [x] Fixed mobile symmetric padding and prevented horizontal scroll blowouts on all 19 custom portfolio pages.

## Refactor Backlog
- [ ] **CSS Consolidation:** Extract the shared core styles (~1200 lines) from all 19 portfolio pages' `style.css` into a single `base.css` file to prevent duplicate maintenance of responsive grids and padding. Only page-specific overrides should remain in the individual folders.
- [ ] **Research Card Templating:** Create a Handlebars partial or build script to inject the "Infinite Memory" research card HTML so edits aren't duplicated across 19 files.
