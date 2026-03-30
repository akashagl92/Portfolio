# PAI Pack: RGCSync

## Overview
Executes the **Recursive Gated Consolidation (RGC)** sync logic. This ensures the IDE context is semantically healthy and all cross-session memories are consolidated into `.pai/state/`.

## 7-Phase Algorithm Mapping
- **OBSERVE**: Detect stale context summaries.
- **THINK**: Check for large file overhead or token limits.
- **PLAN**: Multi-step synthesis plan.
- **BUILD**: Prepare manifest snapshots.
- **EXECUTE**: Run `ide_sentinel.py` and `ide_synthesizer.py`.
- **VERIFY**: Check `context_summaries.json` for integrity.
- **LEARN**: Record knowledge gaps.

## Installation
`Install the RGCSync pack from .agent/packs/RGCSync/`
