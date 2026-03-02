#!/usr/bin/env bash
set -euo pipefail

resolve_root() {
  if [[ -n "${PAI_PROJECT_ROOT:-}" && -d "${PAI_PROJECT_ROOT}" ]]; then
    echo "${PAI_PROJECT_ROOT}"; return
  fi
  if [[ -d "$(pwd)/.pai" ]]; then
    echo "$(pwd)"; return
  fi
  if git_root="$(git rev-parse --show-toplevel 2>/dev/null)" && [[ -d "${git_root}/.pai" ]]; then
    echo "${git_root}"; return
  fi
  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
  echo "$(cd "${script_dir}/.." && pwd -P)"
}

ROOT_DIR="$(resolve_root)"
RUNTIME_DIR="$ROOT_DIR/.pai/runtime"
PROFILE_FILE="$RUNTIME_DIR/profile.env"
EVENT_LOG="$RUNTIME_DIR/events.log"
mkdir -p "$RUNTIME_DIR"

now_iso() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }

ensure_profile() {
  if [[ ! -f "$PROFILE_FILE" ]]; then
    cat > "$PROFILE_FILE" <<'P'
# PAI Runtime Profile (local, operational; gitignored)
PROFILE=SHADOW
LOCKED=1
REASON=bootstrap_default_shadow
UPDATED_AT=1970-01-01T00:00:00Z
SUBAGENT_ENABLED=1
SUBAGENT_MODE=proposal_only
SUBAGENT_MAX_CONCURRENCY=2
SUBAGENT_TIMEOUT_SEC=180
SUBAGENT_PARENT_ONLY_WRITES=1
SUBAGENT_NATIVE_WRITES=0
CAPABILITY_SPAWN_SUBAGENT=1
P
  fi
}

load_state() {
  ensure_profile
  # shellcheck disable=SC1090
  source "$PROFILE_FILE"
  : "${PROFILE:=SHADOW}"
  : "${LOCKED:=1}"
  : "${REASON:=bootstrap_default_shadow}"
  : "${UPDATED_AT:=$(now_iso)}"
  : "${SUBAGENT_ENABLED:=1}"
  : "${SUBAGENT_MODE:=proposal_only}"
  : "${SUBAGENT_MAX_CONCURRENCY:=2}"
  : "${SUBAGENT_TIMEOUT_SEC:=180}"
  : "${SUBAGENT_PARENT_ONLY_WRITES:=1}"
  : "${SUBAGENT_NATIVE_WRITES:=0}"
  : "${CAPABILITY_SPAWN_SUBAGENT:=1}"
}

write_state() {
  local reason_override="$1"
  UPDATED_AT="$(now_iso)"
  REASON="$reason_override"
  cat > "$PROFILE_FILE" <<P
# PAI Runtime Profile (local, operational; gitignored)
# PROFILE: SHADOW|NATIVE
PROFILE=$PROFILE
# LOCKED: 1 enforces SHADOW deny policy, 0 allows profile transition
LOCKED=$LOCKED
REASON=$REASON
UPDATED_AT=$UPDATED_AT
# SUBAGENT_ENABLED: 0|1
SUBAGENT_ENABLED=$SUBAGENT_ENABLED
# SUBAGENT_MODE: single_parent|proposal_only|scoped_write
SUBAGENT_MODE=$SUBAGENT_MODE
SUBAGENT_MAX_CONCURRENCY=$SUBAGENT_MAX_CONCURRENCY
SUBAGENT_TIMEOUT_SEC=$SUBAGENT_TIMEOUT_SEC
SUBAGENT_PARENT_ONLY_WRITES=$SUBAGENT_PARENT_ONLY_WRITES
SUBAGENT_NATIVE_WRITES=$SUBAGENT_NATIVE_WRITES
# CAPABILITY_SPAWN_SUBAGENT: 0|1
CAPABILITY_SPAWN_SUBAGENT=$CAPABILITY_SPAWN_SUBAGENT
P
  echo "$UPDATED_AT profile=$PROFILE locked=$LOCKED mode=$SUBAGENT_MODE reason=$REASON" >> "$EVENT_LOG"
}

usage() {
  cat <<U
Usage:
  scripts/pai_runtime_guard.sh status
  scripts/pai_runtime_guard.sh shadow-on <reason>
  scripts/pai_runtime_guard.sh native-on <reason> [--force]
  scripts/pai_runtime_guard.sh lock <reason>
  scripts/pai_runtime_guard.sh unlock <reason>
  scripts/pai_runtime_guard.sh subagent-on <reason>
  scripts/pai_runtime_guard.sh subagent-off <reason>
  scripts/pai_runtime_guard.sh mode <single_parent|proposal_only|scoped_write> [reason]
U
}

cmd="${1:-status}"
reason="${2:-manual}"

case "$cmd" in
  status)
    load_state
    echo "ROOT_DIR=$ROOT_DIR"
    echo "PROFILE_FILE=$PROFILE_FILE"
    echo "PROFILE=$PROFILE"
    echo "LOCKED=$LOCKED"
    echo "REASON=$REASON"
    echo "UPDATED_AT=$UPDATED_AT"
    echo "SUBAGENT_ENABLED=$SUBAGENT_ENABLED"
    echo "SUBAGENT_MODE=$SUBAGENT_MODE"
    echo "SUBAGENT_MAX_CONCURRENCY=$SUBAGENT_MAX_CONCURRENCY"
    echo "SUBAGENT_TIMEOUT_SEC=$SUBAGENT_TIMEOUT_SEC"
    echo "SUBAGENT_PARENT_ONLY_WRITES=$SUBAGENT_PARENT_ONLY_WRITES"
    echo "SUBAGENT_NATIVE_WRITES=$SUBAGENT_NATIVE_WRITES"
    echo "CAPABILITY_SPAWN_SUBAGENT=$CAPABILITY_SPAWN_SUBAGENT"
    ;;
  shadow-on)
    load_state
    PROFILE="SHADOW"; LOCKED="1"
    write_state "$reason"
    echo "Switched to SHADOW and locked"
    ;;
  native-on)
    load_state
    if [[ "$LOCKED" == "1" && "${3:-}" != "--force" ]]; then
      echo "Refusing native-on while locked (use --force in explicit verification only)."
      exit 2
    fi
    PROFILE="NATIVE"; LOCKED="0"
    write_state "$reason"
    echo "Switched to NATIVE"
    ;;
  lock)
    load_state
    LOCKED="1"
    write_state "$reason"
    echo "Locked profile"
    ;;
  unlock)
    load_state
    LOCKED="0"
    write_state "$reason"
    echo "Unlocked profile"
    ;;
  subagent-on)
    load_state
    SUBAGENT_ENABLED="1"
    write_state "$reason"
    echo "Sub-agent spawning enabled"
    ;;
  subagent-off)
    load_state
    SUBAGENT_ENABLED="0"
    write_state "$reason"
    echo "Sub-agent spawning disabled"
    ;;
  mode)
    load_state
    mode_value="${2:-proposal_only}"
    case "$mode_value" in
      single_parent|proposal_only|scoped_write) ;;
      *) echo "Invalid mode: $mode_value"; exit 1 ;;
    esac
    SUBAGENT_MODE="$mode_value"
    write_state "${3:-manual_mode_change}"
    echo "Sub-agent mode set to $SUBAGENT_MODE"
    ;;
  *)
    usage
    exit 1
    ;;
esac
