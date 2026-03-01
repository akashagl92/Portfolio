# ADR 0004: Persona-Driven Narrative Automation

## Status
Accepted (2026-03-01)

## Context
The user's career narrative (portfolios, social posts) needs to be authentic, reproducible, and consistent across multiple agent interactions. Previous attempts to manually "teach" the persona during a session were transient and prone to "trying too hard" (overusing historical catchphrases).

## Decision
Institutionalize the "User Voice" as a persistent project-local artifact.

1.  **Storage**: Centralized in `.pai/personas/user_voice.md`.
2.  **Synthesis**: Define persona by *traits*, *writing signatures*, and *friction points* rather than a collection of quotes.
3.  **Consumption**: Global workflows (e.g., `capture_social.md`) and project scripts must reference this file for grounding during LLM synthesis steps rather than relying on system prompt overrides alone.

## Consequences
- **Positive**: Reliability and reproducibility across sessions/agents. Easier to "tune" the voice in one place.
- **Negative**: Adds a file dependency to the capture workflow. Agents must proactively read the persona file.
- **Risk**: Over-reliance on the persona file might still lead to "stiff" writing if the agent doesn't interpret the *spirit* of the traits correctly.
