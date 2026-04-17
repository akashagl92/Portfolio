---
description: Enforce NATIVE-first guarded mode with one-way fallback before task work
---
# Session Bootstrap (NATIVE First, Guarded)

Run this workflow first in every new or reloaded session.

## When To Run
- At the beginning of every new chat thread.
- Immediately after IDE reload/restart.
- After any native artifact spinner/cancel/failure event.
- Before running any non-trivial workflow (`/persona_orchestration`, `/research_spawn`, `/pai_sync`).

## Goal
Default to native main-lane artifact operations while preserving automatic one-way fallback to SHADOW on native instability.

## Steps
1. Run runtime preflight:
   - `scripts/pai_runtime_guard.sh status`
2. Enforce native-first transient state:
   - `scripts/pai_runtime_guard.sh native-on session_bootstrap_native`
3. Re-run preflight:
   - `scripts/pai_runtime_guard.sh status`
4. Read and echo the active profile fields:
   - `PROFILE`
   - `LOCKED`
   - `SUBAGENT_ENABLED`
   - `CAPABILITY_SPAWN_SUBAGENT`
5. Validate native fallback controls:
   - `PAI_NATIVE_AUTO_SHADOW_ON_OPEN=1`
   - `PAI_NATIVE_ARTIFACT_AUTO_FALLBACK_ENABLED=1`
   - `PAI_NATIVE_ARTIFACT_OBSERVE_ONLY=0`
   - `PAI_NATIVE_ARTIFACT_ONE_WAY_SHADOW=1`
6. Record bootstrap entry:
   - `printf -- "- [ ] Session bootstrap enforced at %s (native-first guarded mode)\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> .pai/tasks/todo.md`
7. Return one token:
   - `NATIVE_ENFORCED` when `NATIVE_ARTIFACTS_ALLOWED=1`
   - `SHADOW_FALLBACK_ACTIVE` when `NATIVE_ARTIFACTS_ALLOWED=0`

## Native-First Contract (Explicit)
- Primary lane is native for main-lane artifacts (`Task`, `Implementation Plan`, `Walkthrough`) when `NATIVE_ARTIFACTS_ALLOWED=1`.
- On native failure/circuit open, runtime auto-falls back one-way `NATIVE -> SHADOW`.
- Never auto-switch back to native inside a failing session.
- Under fallback (`PROFILE=SHADOW` or `LOCKED=1`), write only to:
  - `.pai/tasks/todo.md`
  - `.pai/plans/active_plan.md`
  - `.pai/walkthrough-final.md`

## Hard Failure Rule (Non-Negotiable)
- If `NATIVE_ARTIFACTS_ALLOWED=0`, do not attempt native artifact edits.
- Continue in SHADOW lane and log fallback reason in `.pai/tasks/todo.md`.

## Failure Behavior
- If native mutation fails during a task:
  1. Runtime opens circuit and moves profile to SHADOW.
  2. Continue task in SHADOW-only lane.
  3. Record `fallback_to_single_parent` in `.pai/tasks/todo.md`.

## Optional Research Routing
- If a task is research-heavy and both flags are enabled:
  - `SUBAGENT_ENABLED=1`
  - `CAPABILITY_SPAWN_SUBAGENT=1`
- Then use `scripts/pai_subagent_ctl.sh spawn ...`.
- Otherwise continue in single-parent mode and log fallback.
