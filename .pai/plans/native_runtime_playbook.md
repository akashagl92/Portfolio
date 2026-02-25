# Native Runtime Playbook (Codex + Antigravity)

Date: 2026-02-23
Scope: Native artifact safety, fallback, and rollback.

## Profiles
- `NATIVE`: Native artifacts enabled under strict Turn Quarantine.
- `SHADOW`: Native artifacts disabled for session; `.pai/*` is source of truth.

## Turn Quarantine Rules
- One native artifact mutation per turn.
- Never batch native artifact mutation with any other mutating call.
- Notify/update messages run in a dedicated turn.

## Circuit Breaker
Trigger breaker immediately when:
- Native artifact remains in `Editing` spinner state.
- Tool call stalls or does not return completion token.
- Feedback/edit action deadlocks.

Breaker actions:
1. Cancel stuck action.
2. Reload IDE window.
3. Switch profile to `SHADOW`:
   - `scripts/pai_runtime_guard.sh shadow-on native_stall`
4. Continue in:
   - `.pai/plans/active_plan.md`
   - `.pai/tasks/todo.md`

## Verification Suite
1. Isolated native plan write.
2. Isolated native task write.
3. Isolated notify turn.
4. Native feedback/edit loop update.
5. Mixed-intent prompt (plan + task + notify in one request; agent must decompose).

Pass: all 5 steps complete without persistent spinner.
Fail: any step deadlocks -> lock profile to `SHADOW` for session.

## Guard Commands
- Current status:
  - `scripts/pai_runtime_guard.sh status`
- Force shadow lock:
  - `scripts/pai_runtime_guard.sh shadow-on native_stall`
- Re-enable native after verified recovery:
  - `scripts/pai_runtime_guard.sh native-on verification_pass --force`

## Immediate Rollback
If runtime degrades after framework changes:
1. Restore previous local rule file from backup.
2. Reload window.
3. Continue in `SHADOW`.
