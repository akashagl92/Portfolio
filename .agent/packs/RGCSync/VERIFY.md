# PAI Sync Ritual - Verification & Execution

## 1. Pre-Flight (OBSERVE)
- [ ] Read `.agent/packs/RGCSync/src/rgc_sync.md` for logic baseline.
- [ ] Check if `python3` and necessary scripts exist in `scripts/rgc/`.

## 2. Risk Assessment (THINK)
- [ ] Identify large text blocks that might cause context overflow.

## 3. Execution (EXECUTE)
- [ ] Run RGC Sentinel.
- [ ] Run RGC Synthesizer.

## 4. Closure (LEARN)
- [ ] Verify `.pai/state/context_summaries.json` was updated.
- [ ] Sync results via `scripts/pai_native_artifact_bridge.sh run-once`.
