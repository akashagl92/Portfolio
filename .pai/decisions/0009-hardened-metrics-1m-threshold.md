# ADR-0009: Infinite Memory Hardened Metrics Update (1M Threshold)

- **Status**: Active
- **Date**: 2026-02-25
- **Context**: The "Infinite Memory" research card on the portfolio was displaying an outdated 100k turn threshold for the SSC/RGC switch. The hardened GR-006 rule in `global_learnings.md` had been updated to confirm:
  - SSC is the **Efficient Default** up to **1,000,000 turns** ($O(1)$ retrieval, >99.9% efficiency).
  - RGC engages as the **Extreme Sentinel** above 1M turns.
  - \~12% decay acceleration from code-heavy distractors (Synthetic Saturation).
- **Decision**: Updated all 19 portfolio pages to reflect the latest hardened findings, including the 1M threshold, O(1) retrieval, and Synthetic Saturation stress-test results.
- **Consequences**: Portfolio now accurately reflects the research paper's latest validated architecture. Any future threshold changes from the research need to be propagated to all 19 pages.
