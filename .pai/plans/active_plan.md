# Orchestration Plan - QA Gate Restoration & Chronicler Stability

Restore the global QA infrastructure and optimize the documentation synthesis pipeline to be more resilient to LLM rate limits.

## User Review Required
> [!IMPORTANT]
> The `qa_gate` workflow requires several scripts (`scripts/pai_stage_detect.sh`, `scripts/pai_skill_ctl.sh`) to be present in the project. I will verify if these exist or need stubs.

## Proposed Changes

### 1. Global Workflows
#### [NEW] [qa_gate.md](file:///Users/akashagrawal/.gemini/workflows/qa_gate.md)
Restore the stage-aware QA gate workflow from the `moltbot` reference.

### 2. Documentation Pipeline
#### [MODIFY] [agentic_chronicler.py](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/scripts/agentic_chronicler.py)
Update the synthesis logic to prioritize the project's `pushed_at` timestamp for cache validation. This ensures we only synthesize repositories that have had actual activity since the last success, drastically reducing LLM calls.

-   Add `iso8601` parsing or simple string comparison for `pushed_at`.
-   If `pushed_at` <= `cache['last_updated']`, skip synthesis even if the detailed hash changed slightly (minimizing noise).
-   Increase cooldown/jitter for free-tier providers.

## Verification Plan

### Automated Tests
- Run `scripts/agentic_chronicler.py --dry-run` to verify cache logic works with timestamps.
- Check if `qa_gate` shows up in available workflows.

### Manual Verification
- Verify that `qa_gate` runs and detects the current stage correctly.
