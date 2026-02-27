#!/usr/bin/env bash
set -euo pipefail

resolve_root() {
  if [[ -n "${PAI_PROJECT_ROOT:-}" && -d "${PAI_PROJECT_ROOT}" ]]; then
    echo "${PAI_PROJECT_ROOT}"
    return
  fi
  if [[ -d "$(pwd)/.pai" ]]; then
    echo "$(pwd)"
    return
  fi
  if git_root="$(git rev-parse --show-toplevel 2>/dev/null)" && [[ -d "${git_root}/.pai" ]]; then
    echo "${git_root}"
    return
  fi
  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
  echo "$(cd "${script_dir}/.." && pwd -P)"
}

ROOT_DIR="$(resolve_root)"
RUNTIME_DIR="$ROOT_DIR/.pai/runtime"
PROFILE_FILE="$RUNTIME_DIR/profile.env"
SUBAGENT_DIR="$RUNTIME_DIR/subagents"
EVENT_LOG="$SUBAGENT_DIR/events.log"
WORKER_SCRIPT="$ROOT_DIR/scripts/pai_subagent_worker.sh"

mkdir -p "$SUBAGENT_DIR"

now_iso() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

ensure_profile() {
  if [[ -f "$PROFILE_FILE" ]]; then
    # shellcheck disable=SC1090
    source "$PROFILE_FILE"
  fi
  : "${PROFILE:=SHADOW}"
  : "${LOCKED:=1}"
  : "${SUBAGENT_ENABLED:=0}"
  : "${SUBAGENT_MODE:=research_only}"
  : "${SUBAGENT_MAX_CONCURRENCY:=2}"
  : "${SUBAGENT_TIMEOUT_SEC:=180}"
  : "${SUBAGENT_PARENT_ONLY_WRITES:=1}"
  : "${SUBAGENT_NATIVE_WRITES:=0}"
  : "${CAPABILITY_SPAWN_SUBAGENT:=0}"
}

count_active_jobs() {
  local count=0
  shopt -s nullglob
  for state in "$SUBAGENT_DIR"/*/state.env; do
    status="$(grep -E '^STATUS=' "$state" | tail -n 1 | cut -d= -f2- || true)"
    if [[ "$status" == "spawning" || "$status" == "running" ]]; then
      count=$((count + 1))
    fi
  done
  shopt -u nullglob
  echo "$count"
}

write_event() {
  echo "$(now_iso) $*" >> "$EVENT_LOG"
}

check_no_forbidden_targets() {
  local command_text="$1"
  local forbidden=(
    "task.md"
    "implementation_plan.md"
    ".pai/tasks/todo.md"
    ".pai/plans/active_plan.md"
  )
  for token in "${forbidden[@]}"; do
    if [[ "$command_text" == *"$token"* ]]; then
      echo "Rejected command: references forbidden shared artifact token '$token'"
      exit 4
    fi
  done
}

cmd="${1:-help}"

case "$cmd" in
  spawn)
    shift
    ensure_profile

    if [[ "$SUBAGENT_ENABLED" != "1" ]]; then
      echo "Spawn disabled: SUBAGENT_ENABLED=$SUBAGENT_ENABLED"
      exit 3
    fi
    if [[ "$CAPABILITY_SPAWN_SUBAGENT" != "1" ]]; then
      echo "Spawn capability unavailable: CAPABILITY_SPAWN_SUBAGENT=$CAPABILITY_SPAWN_SUBAGENT"
      exit 3
    fi

    if [[ ! -x "$WORKER_SCRIPT" ]]; then
      echo "Worker script missing or not executable: $WORKER_SCRIPT"
      exit 2
    fi

    if [[ "$#" -lt 3 ]]; then
      echo "Usage: scripts/pai_subagent_ctl.sh spawn <label> -- <command>"
      exit 1
    fi

    label="$1"
    shift
    if [[ "${1:-}" != "--" ]]; then
      echo "Usage: scripts/pai_subagent_ctl.sh spawn <label> -- <command>"
      exit 1
    fi
    shift
    if [[ "$#" -lt 1 ]]; then
      echo "Missing command after --"
      exit 1
    fi

    command_text="$*"
    check_no_forbidden_targets "$command_text"

    active="$(count_active_jobs)"
    if (( active >= SUBAGENT_MAX_CONCURRENCY )); then
      echo "Spawn denied: active=$active max=$SUBAGENT_MAX_CONCURRENCY"
      exit 5
    fi

    id="$(date -u +%Y%m%dT%H%M%SZ)-$RANDOM"
    job_dir="$SUBAGENT_DIR/$id"
    mkdir -p "$job_dir"

    cat > "$job_dir/command.sh" <<EOF
#!/usr/bin/env bash
set -euo pipefail
cd "$ROOT_DIR"
$command_text
EOF
    chmod +x "$job_dir/command.sh"

    cat > "$job_dir/state.env" <<EOF
ID=$id
LABEL=$label
STATUS=spawning
CREATED_AT=$(now_iso)
MODE=$SUBAGENT_MODE
COMMAND=$command_text
ROOT_DIR=$ROOT_DIR
EOF

    nohup "$WORKER_SCRIPT" "$job_dir" "$SUBAGENT_TIMEOUT_SEC" >> "$job_dir/worker.log" 2>&1 &
    worker_pid=$!
    echo "WORKER_PID=$worker_pid" > "$job_dir/launcher.env"

    write_event "spawn id=$id label=$label mode=$SUBAGENT_MODE worker_pid=$worker_pid"
    echo "SPAWNED id=$id label=$label mode=$SUBAGENT_MODE"
    echo "JOB_DIR=$job_dir"
    ;;

  status)
    shift
    if [[ "$#" -ne 1 ]]; then
      echo "Usage: scripts/pai_subagent_ctl.sh status <id>"
      exit 1
    fi
    id="$1"
    state="$SUBAGENT_DIR/$id/state.env"
    if [[ ! -f "$state" ]]; then
      echo "Unknown subagent id: $id"
      exit 2
    fi
    cat "$state"
    ;;

  list)
    shopt -s nullglob
    for state in "$SUBAGENT_DIR"/*/state.env; do
      id="$(grep -E '^ID=' "$state" | tail -n 1 | cut -d= -f2- || true)"
      status="$(grep -E '^STATUS=' "$state" | tail -n 1 | cut -d= -f2- || true)"
      label="$(grep -E '^LABEL=' "$state" | tail -n 1 | cut -d= -f2- || true)"
      echo "${id:-unknown} ${status:-unknown} ${label:-unknown}"
    done
    shopt -u nullglob
    ;;

  cancel)
    shift
    if [[ "$#" -ne 1 ]]; then
      echo "Usage: scripts/pai_subagent_ctl.sh cancel <id>"
      exit 1
    fi
    id="$1"
    job_dir="$SUBAGENT_DIR/$id"
    state="$job_dir/state.env"
    if [[ ! -f "$state" ]]; then
      echo "Unknown subagent id: $id"
      exit 2
    fi
    touch "$job_dir/cancel.requested"
    if [[ -f "$job_dir/pids.env" ]]; then
      # shellcheck disable=SC1090
      source "$job_dir/pids.env"
      if [[ -n "${CMD_PID:-}" ]]; then
        kill -TERM "$CMD_PID" 2>/dev/null || true
      fi
    fi
    write_event "cancel id=$id"
    echo "CANCEL_REQUESTED id=$id"
    ;;

  collect)
    shift
    if [[ "$#" -ne 1 ]]; then
      echo "Usage: scripts/pai_subagent_ctl.sh collect <id>"
      exit 1
    fi
    id="$1"
    job_dir="$SUBAGENT_DIR/$id"
    state="$job_dir/state.env"
    if [[ ! -f "$state" ]]; then
      echo "Unknown subagent id: $id"
      exit 2
    fi
    state_id="$(grep -E '^ID=' "$state" | tail -n 1 | cut -d= -f2- || true)"
    status="$(grep -E '^STATUS=' "$state" | tail -n 1 | cut -d= -f2- || true)"
    exit_code="$(grep -E '^EXIT_CODE=' "$state" | tail -n 1 | cut -d= -f2- || true)"
    duration_sec="$(grep -E '^DURATION_SEC=' "$state" | tail -n 1 | cut -d= -f2- || true)"
    echo "ID=${state_id:-$id}"
    echo "STATUS=${status:-unknown}"
    echo "EXIT_CODE=${exit_code:-}"
    echo "DURATION_SEC=${duration_sec:-}"
    echo "--- STDOUT ---"
    sed -n '1,200p' "$job_dir/stdout.log" 2>/dev/null || true
    echo "--- STDERR ---"
    sed -n '1,120p' "$job_dir/stderr.log" 2>/dev/null || true
    ;;

  *)
    echo "Usage:"
    echo "  scripts/pai_subagent_ctl.sh spawn <label> -- <command>"
    echo "  scripts/pai_subagent_ctl.sh status <id>"
    echo "  scripts/pai_subagent_ctl.sh list"
    echo "  scripts/pai_subagent_ctl.sh cancel <id>"
    echo "  scripts/pai_subagent_ctl.sh collect <id>"
    exit 1
    ;;
esac
