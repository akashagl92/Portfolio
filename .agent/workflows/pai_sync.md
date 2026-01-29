---
description: Run the comprehensive PAI synchronization ritual (Save Game)
---

---
description: Run the comprehensive PAI synchronization ritual (Save Game)
---
# PAI Sync Ritual (The "Save Game")

This workflow acts as a **"Save Game"** for your project. Run it before ending a session, switching tasks, or when context feels stale.

## Steps

### 1. 🔄 Review & Grounding (Two Loops)
1.  **Read the North Star**: Read [.pai/manifest.md](cci:7://file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/.pai/manifest.md:0:0-0:0).
2.  **Two Loops Check**: Ask: "Are we in Strategy (Outer) or Execution (Inner) mode?"
3.  **Core Check**: "Is our current work still serving these Core Objectives?" (Update Manifest if no).

### 2. 🧠 Capture Knowledge (ADR & RCA)
1.  **Scan Usage**: Run `git log --since="24 hours ago" --oneline`.
2.  **Architectural Decisions (ADR)**:
    *   Did we add a library, change a pattern, or refactor a core component?
    *   *Action*: Create `.pai/decisions/XXXX-short-title.md`.
3.  **Learnings (RCA)**:
    *   Did we fix a bug or encounter a "gotcha"?
    *   *Action*: Create `.pai/learnings/YYYY-MM-DD-topic.md`.

### 3. 🌟 Manifest Update
1.  **Update**: Adjust "Current State" in [.pai/manifest.md](cci:7://file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/.pai/manifest.md:0:0-0:0) to match reality.

### 4. 🌍 Global Sync (Antigravity)
1.  **Scan**: Look for insights in `.pai/learnings/` that apply *universally* (e.g., "React 19 breaks X").
2.  **Promote**: Propose: "Promote [Insight] to Global Rules (`~/.gemini/GEMINI.md`)?"

### 5. ✂️ Review & Prune
1.  **Deprecate**: Check if recent work supersedes old ADRs.
    *   *Action*: Mark header `Status: Superseded by [New File]`. (Do not delete history).
    *   *Archive*: Move obsolete workflows to `_archive/`.

### 6. 🧹 Clean Up
1.  **Check**: Verify no temporary scripts or debug files were left behind.