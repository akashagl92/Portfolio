---
description: Run the code hygiene & refactoring ritual (The Cleanse)
---
# Refactor Ritual (The "Cleanse")

Run this workflow **weekly** or immediately after a `pai-sync` identifies significant technical debt.

## Steps

### 1. 🔍 Codebase Hygiene (The Garden)
*Before fixing complex logic, clear the weeds.*
1.  **Dead Files**: Run `ls -R` or use IDE tools to find unused scripts, `temp_*.ts`, or "v1" backups.
    *   *Action*: Delete or move to `_archive/`.
2.  **Dead Workflows**: Check `.agent/workflows/`. Are any obsolete?
    *   *Action*: Move to `_archive/` or delete.
3.  **Manifest Prune**: Read `.pai/manifest.md`. Remove completed goals.

### 2. 🎯 Identify Targets (The Build)
1.  **Scan Learnings**: Read `.pai/learnings/` for recent "Root Cause Analyses" (RCAs).
2.  **Scan Decisions**: Read `.pai/decisions/` for "Status: Proposed" items.
3.  **Selection**: Pick **ONE** cohesive task (e.g., "Implement Adaptive Scaling" or "Refactor Graph Lifecycle").

### 3. 🛡️ Strategy Check (The "Why")
1.  **Validation**: "Does this refactor serve the Core Objectives (Manifest)?"
2.  **Plan**: Write a 1-line plan: "Refactoring [X] to fix [Y], enabling [Z]."

### 4. 🔪 The Surgery (Execution)
1.  **Refactor**: Perform the changes. Focus on Modularity.
2.  **Tests**: Update tests to cover new logic.
3.  **Clean**: Remove deprecated comments/code blocks.

### 5. 📝 Documentation Sync
1.  **Update ADR**: If architecture changed, update `.pai/decisions/`.
2.  **Close Learning**: Add `**Resolved**: Fixed in commit [hash]` to the Learning record.

### 6. ✅ Verify & Commit
1.  **Health Check**: Run full build/test suite.
2.  **Commit**: `git commit -m "refactor: [topic] (relates to Learning-XXX)"`
