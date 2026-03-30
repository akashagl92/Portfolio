# PAI Sync Ritual - Verification & Execution

> AI AGENT INSTRUCTIONS: When invoking this script, run through the following steps to execute the PAI Sync in the local project environment.

## 1. Runtime Grounding (OBSERVE)
- [ ] Read `.pai/manifest.md` to identify current project state.
- [ ] Read `.pai/tasks/lessons.md` to identify any recent friction loops.

## 2. Capture Knowledge (LEARN)
- [ ] Run `git log --since="24 hours ago"`.
- [ ] Draft any recent unrecorded Architectural Decisions into `.pai/decisions/`.
- [ ] Record Root Cause Analysis in `.pai/learnings/` if applicable.

## 3. Global Sync & Telemetry (EXECUTE)
- [ ] Run `bash scripts/pai_telemetry_report.sh`.
- [ ] Run `bash scripts/pai_quality_gate_eval.sh`.

## 4. Semantic Health Check (VERIFY)
- [ ] Execute IDE sentinel checks (`python3 ~/.gemini/scripts/conversation_sentinel.py`).
- [ ] Verify `.pai/state/conversation_knowledge.json` is updated.
- [ ] Run `bash scripts/rgc_sync.sh` (if applicable).

## 5. Clean & Prune
- [ ] Cleanup temporary files.
- [ ] Verify bridge stability (`scripts/pai_native_artifact_bridge.sh status`).
