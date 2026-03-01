# PAI v2.2 System Architecture — Portfolio-Fetch

This document outlines the architectural blueprint of the Personal AI Infrastructure (PAI) v2.2 ecosystem within the `Portfolio-Fetch` project and its global counterpart.

## 1. Core Philosophy: The Two Loops
The system operates on a "Two Loops" model:
- **Outer Loop (Strategic):** Managed via `.pai/manifest.md` and ADRs. Defines the "Why" and "What."
- **Inner Loop (Execution):** Managed via Workflows and Sub-agents. Defines the "How."

## 2. Infrastructure Tiers

### A. Global Infrastructure (`~/.gemini/`)
The Global Brain stores "Capability Primitives" that are shared across all projects.

| Component | Path | Description |
| :--- | :--- | :--- |
| **Skills** | `~/.gemini/antigravity/skills/` | Specialist "specialties" (e.g., `quality-gate`). |
| **Workflows** | `~/.gemini/workflows/` | Hardened, project-agnostic rituals (e.g., `rgc_sync`). |
| **Global Brain** | `~/.gemini/brain/` | Cross-project learnings (`global_learnings.md`). |

### B. Project-Local Layer (`Portfolio-Fetch/.pai/`)
Local memory and project-specific orchestration.

| Directory | Description |
| :--- | :--- |
| `.pai/manifest.md` | The North Star/Goals of this specific project. |
| `.pai/decisions/` | Architectural Decision Records (ADR). |
| `.pai/tasks/` | Session-level tracking (`todo.md`). |
| `.pai/state/` | Persistent context summaries (RGC storage). |

## 3. Interaction Mechanics

### A. The Skill-Workflow Bridge
Standardized capabilities are injected into project rituals using a **Skill Controller**.

```mermaid
sequenceDiagram
    participant W as "Local Workflow (/qa_gate)"
    participant C as "Skill Controller (pai_skill_ctl.sh)"
    participant S as "Global Skill (quality-gate)"
    participant P as "Project Files"

    W->>C: Call "run quality-gate"
    C->>S: Locate & Execute audit_codebase.sh
    S->>P: Scan for secrets/patterns
    P-->>S: Return findings
    S-->>C: Exit Code (0/1)
    C-->>W: Pass/Fail Result
```

### B. Sub-agent Lifecycle
Hierarchical delegation for complex or parallel work.

```mermaid
graph TD
    Parent["Parent Agent (Orchestrator)"]
    Sub["Child Sub-agent (Worker)"]
    Global["Global Skill Brain"]

    Parent -- Spawn --> Sub
    Sub -- Read SKILL.md --> Global
    Sub -- Execute Task --> Project["Local Files"]
    Project -- Results --> Sub
    Sub -- Collect --> Parent
```

### C. The RGC Sync Loop
Recursive Gated Consolidation ensures long-term memory doesn't "decay."

```mermaid
graph LR
    A["New Learning"] --> B["L0 Sentinel"]
    B -- Gated Signal --> C["rgc_buffer.json"]
    C --> D["L1 Synthesizer"]
    D -- Consolidation --> E["context_summaries.json"]
    E -- Grounding --> F["Next Session"]
```

### D. The Agentic Chronicler (Docs Sync)
The `/update_docs` workflow utilizes an "LLM Council" to synthesize project reality into human-readable portfolios.

```mermaid
graph TD
    Raw["Raw Data: GitHub/Commits/README"] --> Eng["Engineer Persona: Tech Stack"]
    Raw --> Rec["Recruiter Persona: Impact"]
    Eng --> Chair["Chairman: Synthesis"]
    Rec --> Chair
    Chair -- JSON Summary --> README["Dynamic README.md"]
    README --> Git["Git Push/Deploy"]
```

## 4. Holistic Interaction Map
How all components work together to provide a robust, self-healing mechanism across projects.

```mermaid
graph TD
    subgraph Global_Layer ["Global Capability Layer (~/.gemini/)"]
        GS["Global Skills: quality-gate, research-spawn"]
        GL["Global Learnings: brain/global_learnings.md"]
        GW["Global Workflows: rgc_sync"]
    end

    subgraph Project_Layer ["Project Operational Layer (.pai/)"]
        W_QA["/qa_gate"]
        W_RG["/rgc_sync"]
        W_DOC["/update_docs"]
        W_REF["/refactor"]
        CTL["pai_skill_ctl.sh"]
        SENT["rgc_sentinel.py"]
    end

    subgraph Agentic_Core ["Agentic Synthesis / The Council"]
        AC["agentic_chronicler.py (The Council)"]
        CS["conversation_sentinel.py"]
        Council_P["Engineer | Recruiter | Chairman"]
    end

    W_QA -- Orchestrates --> CTL
    CTL -- Calls --> GS
    GS -- Verifies --> Project["Project Files"]
    
    W_RG -- Runs --> SENT
    SENT -- Gates --> GL
    
    W_DOC -- Triggers --> AC
    AC -- "1. Analysis & Pitch" --> Council_P
    Council_P -- "2. Fact-Check" --> Project
    Council_P -- "3. Synthesis" --> README["Dynamic README.md"]
    
    Project -- Insights --> GL
    GL -- Influences --> W_REF
    
    CS -- Distills --> Session["Conversation Knowledge"]
```

## 5. Key Tooling
- `scripts/pai_skill_ctl.sh`: Proxies local requests to global skills.
- `scripts/pai_subagent_ctl.sh`: Manages the lifecycle of child workers.
- `scripts/rgc/`: Powering the sentinel and synthesizer loops.
- `scripts/agentic_chronicler.py`: The LLM Council for documentation synthesis.

---
*Last Updated: 2026-03-01*
