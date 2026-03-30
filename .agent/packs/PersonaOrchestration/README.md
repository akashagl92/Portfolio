# PAI Pack: PersonaOrchestration

## Overview
Executes complex tasks using a parent-led Outer Loop and sub-agent Inner Loop handoff, utilizing custom personas.

## 7-Phase Algorithm Mapping
- **OBSERVE**: Identify target persona traits in `.pai/personas/`.
- **THINK**: Decide if a sub-agent spawn is necessary for high-volume research.
- **PLAN**: Design the handoff protocol.
- **BUILD**: Provision sub-agent state.
- **EXECUTE**: Run the orchestrated task.
- **VERIFY**: Synthesize and validate sub-agent outputs.
- **LEARN**: Update `persona_usage.json` with success metrics.

## Installation
`Install the PersonaOrchestration pack from .agent/packs/PersonaOrchestration/`
