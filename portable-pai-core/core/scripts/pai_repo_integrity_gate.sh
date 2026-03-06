#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck disable=SC1091
source "$script_dir/pai_core_lib.sh"

ROOT_DIR="$(pai_resolve_root)"
cd "$ROOT_DIR"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "REPO_INTEGRITY_STATUS=SKIP_NOT_GIT"
  exit 0
fi

failures=0

# 1) Gitlinks (submodule entries) in index.
gitlinks="$(git ls-files -s | awk '$1=="160000"{print $4}' || true)"
if [[ -n "$gitlinks" ]]; then
  echo "REPO_INTEGRITY_FAIL gitlinks_present"
  printf '%s\n' "$gitlinks" | sed -n '1,20p'
  failures=$((failures + 1))
fi

# 2) Nested .git directories (except root .git).
nested_git_dirs="$(find . -type d -name .git -print | grep -v '^\./.git$' || true)"
if [[ -n "$nested_git_dirs" ]]; then
  echo "REPO_INTEGRITY_FAIL nested_git_dirs_present"
  printf '%s\n' "$nested_git_dirs" | sed -n '1,20p'
  failures=$((failures + 1))
fi

# 3) Absolute symlinks.
abs_links=0
while IFS= read -r link || [[ -n "$link" ]]; do
  [[ -n "$link" ]] || continue
  target="$(readlink "$link" 2>/dev/null || true)"
  if [[ "$target" == /* ]]; then
    if [[ "$abs_links" -eq 0 ]]; then
      echo "REPO_INTEGRITY_FAIL absolute_symlinks_present"
    fi
    abs_links=$((abs_links + 1))
    echo "$link -> $target"
  fi
done < <(find . -type l -print)
if [[ "$abs_links" -gt 0 ]]; then
  failures=$((failures + 1))
fi

# 4) Broken symlinks.
broken_links="$(find . -type l ! -exec test -e {} \; -print || true)"
if [[ -n "$broken_links" ]]; then
  echo "REPO_INTEGRITY_FAIL broken_symlinks_present"
  printf '%s\n' "$broken_links" | sed -n '1,20p'
  failures=$((failures + 1))
fi

if [[ "$failures" -gt 0 ]]; then
  echo "REPO_INTEGRITY_STATUS=FAIL"
  exit 1
fi

echo "REPO_INTEGRITY_STATUS=PASS"
