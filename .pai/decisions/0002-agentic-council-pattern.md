# ADR-0002: Agentic Council Pattern for Documentation Synthesis

## Status
Hardened

## Context
Project documentation often suffers from being either too technical (lacking impact context) or too marketing-focused (lacking technical depth). To solve this, we need a mechanism that synthesizes raw project data (commits, READMEs, file structures) into a balanced, fact-checked summary.

## Decision
We implement the "Agentic Council" pattern within the `agentic_chronicler.py` script. This pattern uses three distinct AI personas to process project information sequentially.

### The Council Roles
1.  **The Engineer (Analysis):**
    - **Focus:** Technical stack, complexity, and internal logic.
    - **Input:** File structure, recent commits, README.
    - **Output:** Bulleted technical analysis.
2.  **The Recruiter (Impact):**
    - **Focus:** Business value, STAR (Situation, Task, Action, Result) impact.
    - **Input:** Code context + Engineer's analysis.
    - **Output:** Punchy elevator pitch.
3.  **The Chairman (Synthesis):**
    - **Focus:** Fact-checking, meta-commentary removal, and final JSON formatting.
    - **Input:** Engineer's analysis + Recruiter's pitch + Raw Data.
    - **Output:** Final, professional JSON summary (max 80 words).

## Verification
- Successfully integrated into the `/update_docs` workflow.
- Verified output in `Portfolio-Fetch/project-details-ai.json`.
