#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: scripts/pai_subagent_worker.sh <job_dir> <timeout_sec>"
  exit 1
fi

JOB_DIR="$1"
TIMEOUT_SEC="$2"
STATE_FILE="$JOB_DIR/state.env"
COMMAND_FILE="$JOB_DIR/command.sh"
STDOUT_FILE="$JOB_DIR/stdout.log"
STDERR_FILE="$JOB_DIR/stderr.log"
CANCEL_FLAG="$JOB_DIR/cancel.requested"

now_iso() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }

set_state() {
  local key="$1" val="$2"
  if grep -q "^${key}=" "$STATE_FILE" 2>/dev/null; then
    awk -v k="$key" -v v="$val" -F= 'BEGIN{OFS="="} $1==k{$0=k"="v}1' "$STATE_FILE" > "$STATE_FILE.tmp"
    mv "$STATE_FILE.tmp" "$STATE_FILE"
  else
    echo "$key=$val" >> "$STATE_FILE"
  fi
}

[[ -x "$COMMAND_FILE" ]] || { set_state STATUS failed; set_state ERROR missing_command; exit 2; }

set_state STATUS running
set_state STARTED_AT "$(now_iso)"
"$COMMAND_FILE" >"$STDOUT_FILE" 2>"$STDERR_FILE" &
CMD_PID=$!
echo "CMD_PID=$CMD_PID" > "$JOB_DIR/pids.env"

start="$(date +%s)"
while kill -0 "$CMD_PID" 2>/dev/null; do
  if [[ -f "$CANCEL_FLAG" ]]; then
    kill -TERM "$CMD_PID" 2>/dev/null || true
    sleep 1
    kill -KILL "$CMD_PID" 2>/dev/null || true
    wait "$CMD_PID" 2>/dev/null || true
    set_state STATUS cancelled
    set_state EXIT_CODE 130
    set_state ENDED_AT "$(now_iso)"
    exit 0
  fi
  now="$(date +%s)"
  if (( now - start >= TIMEOUT_SEC )); then
    kill -TERM "$CMD_PID" 2>/dev/null || true
    sleep 1
    kill -KILL "$CMD_PID" 2>/dev/null || true
    wait "$CMD_PID" 2>/dev/null || true
    set_state STATUS timed_out
    set_state EXIT_CODE 124
    set_state ENDED_AT "$(now_iso)"
    exit 0
  fi
  sleep 1
done

set +e
wait "$CMD_PID"
RC=$?
set -e

if [[ "$RC" -eq 0 ]]; then
  set_state STATUS completed
else
  set_state STATUS failed
fi
set_state EXIT_CODE "$RC"
set_state ENDED_AT "$(now_iso)"
