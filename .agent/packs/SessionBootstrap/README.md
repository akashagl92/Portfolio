# PAI Pack: SessionBootstrap

## Overview
Enforce SHADOW hard mode at session start before any task work.

## 7-Phase Algorithm Mapping
- **OBSERVE**: Run pre-flight scripts.
- **THINK**: Verify profile status and lock reasons.
- **PLAN**: Initialize session workspace.
- **BUILD**: Symlink global workflows.
- **EXECUTE**: Load PAI environment.
- **VERIFY**: Check `scripts/pai_runtime_guard.sh status`.
- **LEARN**: Record bootstrap telemetry.

## Installation
`Install the SessionBootstrap pack from .agent/packs/SessionBootstrap/`
