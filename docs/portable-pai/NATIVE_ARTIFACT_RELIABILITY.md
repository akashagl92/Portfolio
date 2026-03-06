# Native Artifact Reliability (Project Reference)

Canonical specification:
- `portable-pai-core/docs/native-artifact-reliability.md`

This project is currently configured with:
- `PROFILE=SHADOW` baseline
- `PAI_NATIVE_SHADOW_ENFORCE_BLOCK=1`
- `PAI_NATIVE_ARTIFACT_BRIDGE_ENABLED=1`
- `PAI_RUNTIME_AUTO_ENSURE_BRIDGE=1`

## Daily commands

Minimum:
```bash
scripts/pai_runtime_guard.sh status
```

Read these fields in the output:
- `NATIVE_ARTIFACTS_ALLOWED=0|1`
- `NATIVE_ARTIFACTS_FORBIDDEN_REASON=...` (when blocked)
- `NATIVE_ARTIFACTS_BANNED_TOOLS=...` (when blocked)

Full:
```bash
bash scripts/pai_pilot_preflight.sh
```

## If UI looks stuck on native artifact editing

1. Cancel the currently stuck IDE step.
2. Verify:
```bash
scripts/pai_runtime_guard.sh status
scripts/pai_native_artifact_bridge.sh status
tail -n 80 .pai/events/events.jsonl | rg "native_artifact|bridge|circuit"
```
3. If daemon is stale (`RUNNING=0`), restart:
```bash
scripts/pai_native_artifact_bridge.sh start
```

## Scope note

The current mitigation is effective for:
- blocked native starts in SHADOW
- started native artifact updates that stall

It does not retroactively recover a step already deadlocked before any file/update signal is emitted by the IDE.
