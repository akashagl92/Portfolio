# ADR: Universal Sync & Scale Architecture (v45)

*   **Status**: Accepted
*   **Deciders**: Staff Engineer (PAI), Akash Agrawal (Product Lead)
*   **Date**: 2026-04-17

## Context
The portfolio repository had reached a state of critical fragmentation, with 25+ specialized variants (Airbnb, Crunchyroll, etc.) running localized copies of the logic (`app.js`) and data (`data.json`). This led to visual drift, stale contribution statistics, and excessive maintenance debt.

## Decision
We have unified the platform into a **Master-Shared Architecture**:
1.  **Shared Logic**: All specialized pages now point to the hardened root `app.js`.
2.  **Environment-Aware Fetch**: The logic engine was upgraded to detect environment depth and fetch the root `data.json` globally.
3.  **Legacy Purge**: All 58 redundant local silos (app.js + data.json) were decommissioned.

## Consequences
*   **Positive**: Every page now renders with 100% saturation and baseline alignment parity. Future pages scale automatically without manual file maintenance.
*   **Negative**: Slight dependency on master `app.js` availability (mitigated by local filesystem linkage).
