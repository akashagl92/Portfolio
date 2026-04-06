# PAI Pack: PersonaOrchestration

## Overview
Executes complex tasks using a parent-led Outer Loop and sub-agent Inner Loop handoff, utilizing custom personas.

## 7-Phase Algorithm Mapping
- **OBSERVE**: Identify target persona traits in `.pai/personas/`.
- **THINK**: Decide if a sub-agent spawn is necessary for high-volume research.
- **PLAN**: Design the handoff protocol.
- **BUILD**: Provision sub-agent state in `.pai/runtime/subs/`.
- **EXECUTE**: Run the orchestrated task with a private, unmanaged scratchpad.
- **VERIFY**: Synthesize and validate sub-agent outputs via Parent HRNU.
- **LEARN**: Update `persona_usage.json` with success metrics.

## Orchestration Ritual (v3.6.1)
> [!IMPORTANT]
> **Sub-Agent Safe-Zone**: To prevent IDE UI freezes, all sub-agents must track their "Inner Loop" tasks in `.pai/runtime/subs/sub_task.md` using direct `cat` and `replace_file_content`. They must **NEVER** write to the `brain/` directory.

## Installation
`Install the PersonaOrchestration pack from .agent/packs/PersonaOrchestration/`
