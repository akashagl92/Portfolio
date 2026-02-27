#!/usr/bin/env bash
set -euo pipefail

# Resolve project root robustly even when this script is symlinked from ~/.gemini/scripts.
resolve_root() {
  # 1) Explicit override wins.
  if [[ -n "${PAI_PROJECT_ROOT:-}" && -d "${PAI_PROJECT_ROOT}" ]]; then
    echo "${PAI_PROJECT_ROOT}"
    return
  fi

  # 2) Current working directory if it looks like a PAI project.
  if [[ -d "$(pwd)/.pai" ]]; then
    echo "$(pwd)"
    return
  fi

  # 3) Git repo root from current directory if available.
  if git_root="$(git rev-parse --show-toplevel 2>/dev/null)" && [[ -d "${git_root}/.pai" ]]; then
    echo "${git_root}"
    return
  fi

  # 4) Fallback: parent of script location (works for non-symlink local script install).
  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
  echo "$(cd "${script_dir}/.." && pwd -P)"
}

ROOT_DIR="$(resolve_root)"
RUNTIME_DIR="$ROOT_DIR/.pai/runtime"
PROFILE_FILE="$RUNTIME_DIR/profile.env"
EVENT_LOG="$RUNTIME_DIR/events.log"

mkdir -p "$RUNTIME_DIR"

now_iso() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

write_profile() {
  local profile="$1"
  local locked="$2"
  local reason="$3"
  local ts
  ts="$(now_iso)"
  cat > "$PROFILE_FILE" <<__PROFILE_EOF__
PROFILE=$profile
LOCKED=$locked
REASON=$reason
UPDATED_AT=$ts
__PROFILE_EOF__
  echo "$ts profile=$profile locked=$locked reason=$reason" >> "$EVENT_LOG"
}

read_profile() {
  if [[ -f "$PROFILE_FILE" ]]; then
    # shellcheck disable=SC1090
    source "$PROFILE_FILE"
  else
    PROFILE="NATIVE"
    LOCKED="0"
    REASON="bootstrap_default"
    UPDATED_AT="$(now_iso)"
  fi
}

cmd="${1:-status}"
reason="${2:-manual}"

case "$cmd" in
  status)
    read_profile
    echo "ROOT_DIR=$ROOT_DIR"
    echo "PROFILE_FILE=$PROFILE_FILE"
    echo "PROFILE=$PROFILE"
    echo "LOCKED=$LOCKED"
    echo "REASON=$REASON"
    echo "UPDATED_AT=$UPDATED_AT"
    ;;
  native-on)
    read_profile
    if [[ "${LOCKED:-0}" == "1" && "${3:-}" != "--force" ]]; then
      echo "Refusing native-on because profile is locked. Use --force after verification pass."
      exit 2
    fi
    write_profile "NATIVE" "0" "$reason"
    echo "Switched to NATIVE"
    ;;
  shadow-on)
    write_profile "SHADOW" "1" "$reason"
    echo "Switched to SHADOW and locked"
    ;;
  unlock)
    read_profile
    write_profile "${PROFILE:-SHADOW}" "0" "$reason"
    echo "Unlocked profile"
    ;;
  reset)
    write_profile "NATIVE" "0" "$reason"
    echo "Reset profile to NATIVE"
    ;;
  *)
    echo "Usage:"
    echo "  scripts/pai_runtime_guard.sh status"
    echo "  scripts/pai_runtime_guard.sh shadow-on <reason>"
    echo "  scripts/pai_runtime_guard.sh native-on <reason> [--force]"
    echo "  scripts/pai_runtime_guard.sh unlock <reason>"
    echo "  scripts/pai_runtime_guard.sh reset <reason>"
    exit 1
    ;;
esac
