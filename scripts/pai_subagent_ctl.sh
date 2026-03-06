#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
repo_root="$(cd "${script_dir}/.." && pwd -P)"
canonical="$repo_root/portable-pai-core/core/scripts/pai_subagent_ctl.sh"

if [[ ! -x "$canonical" ]]; then
  echo "Missing canonical script: $canonical" >&2
  exit 2
fi

: "${PAI_PROJECT_ROOT:=$repo_root}"
export PAI_PROJECT_ROOT
exec "$canonical" "$@"
