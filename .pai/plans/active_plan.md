# Implementation Plan - Abnormal Security Portfolio

Tailoring the engineering portfolio for the **AI Product Builder** role at Abnormal Security. This role emphasizes hands-on AI execution (Cursor, Claude Code), agentic workflows, and internal GTM efficiency.

## Proposed Changes

### Abnormal Security Page
- [NEW] `abnormal/index.html`: Base structure updated with Abnormal Security branding and AI Product Builder hero.
- [NEW] `abnormal/app.js`: Tailored for AI summary loading and Abnormal-specific highlighting.
- [NEW] `abnormal/job_description.md`: For local context and script processing.

### Content Tailoring
- **Hero**: Emphasize "AI-Native Productivity" and "GTM Transformation".
- **Professional Projects**:
  - Focus on **Moltbot** (Agentic), **Databricks Genie** (Text-to-SQL), and **VOC Chatbot** (LangGraph).
  - Emphasize internal automation and production-grade agents.
- **Personal Projects**:
  - Highlight **PAI v2** (Orchestration/Memory) and **Infinite Memory** (Research).
  - [NEW] **Multi-Agent Coordination**: Showcasing persona-level sub-agents (System 1/System 2) and how they synchronize for complex deliveries—directly relevant to Abnormal's "AI Transformation Pods".

## Verification & Sub-Agent Test-Case
- **Behavioral Audit**: Verify how sub-agents take effect during the construction of this page.
- **Delivery Sync**: Ensure the main agent coordinates persona-level sub-agent outputs for the final `/abnormal/` page.
- Serve locally and verify `/abnormal/index.html`.
- Ensure AI summaries load correctly via `app.js`.
