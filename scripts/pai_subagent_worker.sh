#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: scripts/pai_subagent_worker.sh <job_dir> <timeout_sec>"
  exit 1
fi

JOB_DIR="$1"
TIMEOUT_SEC="$2"
STATE_FILE="$JOB_DIR/state.env"
PIDS_FILE="$JOB_DIR/pids.env"
COMMAND_FILE="$JOB_DIR/command.sh"
STDOUT_FILE="$JOB_DIR/stdout.log"
STDERR_FILE="$JOB_DIR/stderr.log"
CANCEL_FLAG="$JOB_DIR/cancel.requested"

now_iso() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

write_state_kv() {
  local key="$1"
  local value="$2"
  if [[ -f "$STATE_FILE" ]] && grep -q "^${key}=" "$STATE_FILE"; then
    perl -0777 -pe "s/^${key}=.*\$/${key}=${value}/m" "$STATE_FILE" > "${STATE_FILE}.tmp"
    mv "${STATE_FILE}.tmp" "$STATE_FILE"
  else
    echo "${key}=${value}" >> "$STATE_FILE"
  fi
}

if [[ ! -x "$COMMAND_FILE" ]]; then
  write_state_kv "STATUS" "failed"
  write_state_kv "ERROR" "missing_command_file"
  write_state_kv "ENDED_AT" "$(now_iso)"
  exit 2
fi

START_TS="$(date +%s)"
write_state_kv "STATUS" "running"
write_state_kv "STARTED_AT" "$(now_iso)"
write_state_kv "ERROR" ""

set +e
"$COMMAND_FILE" >"$STDOUT_FILE" 2>"$STDERR_FILE" &
CMD_PID=$!
set -e

echo "CMD_PID=$CMD_PID" > "$PIDS_FILE"

timed_out=0
while kill -0 "$CMD_PID" 2>/dev/null; do
  if [[ -f "$CANCEL_FLAG" ]]; then
    kill -TERM "$CMD_PID" 2>/dev/null || true
    sleep 1
    kill -KILL "$CMD_PID" 2>/dev/null || true
    break
  fi

  now_ts="$(date +%s)"
  elapsed="$((now_ts - START_TS))"
  if (( elapsed >= TIMEOUT_SEC )); then
    timed_out=1
    kill -TERM "$CMD_PID" 2>/dev/null || true
    sleep 1
    kill -KILL "$CMD_PID" 2>/dev/null || true
    break
  fi
  sleep 1
done

set +e
wait "$CMD_PID"
RC=$?
set -e

END_TS="$(date +%s)"
DURATION_SEC="$((END_TS - START_TS))"

if [[ -f "$CANCEL_FLAG" ]]; then
  FINAL_STATUS="cancelled"
  RC=130
elif [[ "$timed_out" == "1" ]]; then
  FINAL_STATUS="timed_out"
  RC=124
elif [[ "$RC" -eq 0 ]]; then
  FINAL_STATUS="completed"
else
  FINAL_STATUS="failed"
fi

write_state_kv "STATUS" "$FINAL_STATUS"
write_state_kv "EXIT_CODE" "$RC"
write_state_kv "ENDED_AT" "$(now_iso)"
write_state_kv "DURATION_SEC" "$DURATION_SEC"
write_state_kv "TIMEOUT_SEC" "$TIMEOUT_SEC"

exit 0
