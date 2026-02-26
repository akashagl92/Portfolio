---
description: Run the documentation & hygiene ritual (The PAI Sync)
---
# PAI Sync Ritual v3.3 (Master Consolidation)

Run this ritual daily or whenever switching contexts. This acts as a **"Save Game"** for your project.

> [!IMPORTANT]
> **Runtime Preflight:** Start by running `scripts/pai_runtime_guard.sh status`. If `PROFILE=SHADOW` or `LOCKED=1`, do not use native Task/Implementation Plan artifacts.

## Steps

### 0. Runtime Preflight
1. Run `scripts/pai_runtime_guard.sh status`.
2. Decide lane: `NATIVE` (artifacts allowed) or `SHADOW` (write to `.pai/` fallback only).

### 1. 🔄 Review & Grounding
1. Read `.pai/manifest.md`.
2. Read `.pai/state/conversation_knowledge.json` (cross-session memory from past IDE conversations).
3. Confirm Strategy (Outer) vs Execution (Inner) mode.
4. Read `.pai/tasks/lessons.md`.

### 2. 🧠 Capture Knowledge (ADR & RCA)
1. Scan recent changes (e.g. `git log --since="24 hours ago"`).
2. Record Architectural Decisions in `.pai/decisions/`.
3. Record Root Cause Analysis/Learnings in `.pai/learnings/`.

### 3. 🌟 State Update & Portfolio
1. **Subagent Handoffs**: If subagents were used, collect all handoffs first.
2. Update "Current State" in `.pai/manifest.md`.
3. **Global Portfolio**: Run `node ~/.gemini/scripts/generate_portfolio.mjs` (if available).

### 4. 🌍 Global Sync & Promotion
1. Evaluate local learnings for promotion to `~/.gemini/brain/global_learnings.md`.
2. **Telemetry**: Update global learning and registry telemetry (if applicable).
3. Scan for universal insights.

### 5. ✂️ Review & Prune
1. Mark superseded ADRs as `Status: Superseded`.
2. Move stale workflows to `_archive/`.
3. Cleanup temporary files.

### 6. 🛡️ Semantic Health Check (RGC)
1. Run `scripts/rgc/ide_sentinel.py`.
2. Run `scripts/rgc/ide_synthesizer.py`.
3. Verify `.pai/state/context_summaries.json` provides a "Strategic Bridge" for the next session.
// turbo
4. Run `python3 ~/.gemini/scripts/conversation_sentinel.py` (IDE Conversation Memory).
5. Verify `.pai/state/conversation_knowledge.json` is updated with recent sessions.
