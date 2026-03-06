#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
repo_root="$(cd "${script_dir}/.." && pwd -P)"
canonical="$repo_root/portable-pai-core/core/scripts/pai_core_lib.sh"

if [[ ! -f "$canonical" ]]; then
  echo "Missing canonical script: $canonical" >&2
  return 2 2>/dev/null || exit 2
fi

# shellcheck disable=SC1090
source "$canonical"
