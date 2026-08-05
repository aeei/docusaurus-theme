#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "usage: $0 <downstream-ref> <upstream-ref>" >&2
  exit 64
}

[[ $# -eq 2 ]] || usage

downstream=$1
upstream=$2

git rev-parse --is-inside-work-tree >/dev/null
git rev-parse --verify "${downstream}^{commit}" >/dev/null
git rev-parse --verify "${upstream}^{commit}" >/dev/null

base=$(git merge-base "$downstream" "$upstream")
read -r ahead behind < <(git rev-list --left-right --count "$downstream...$upstream")

tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT

git diff --name-only "$base..$downstream" | LC_ALL=C sort >"$tmp_dir/downstream-files"
git diff --name-only "$base..$upstream" | LC_ALL=C sort >"$tmp_dir/upstream-files"
comm -12 "$tmp_dir/downstream-files" "$tmp_dir/upstream-files" >"$tmp_dir/overlap-files"

printf 'downstream: %s (%s)\n' "$downstream" "$(git rev-parse "${downstream}^{commit}")"
printf 'upstream:   %s (%s)\n' "$upstream" "$(git rev-parse "${upstream}^{commit}")"
printf 'merge-base: %s\n' "$base"
printf 'ahead:      %s\n' "$ahead"
printf 'behind:     %s\n' "$behind"
printf 'downstream changed files: %s\n' "$(wc -l <"$tmp_dir/downstream-files" | tr -d ' ')"
printf 'upstream changed files:   %s\n' "$(wc -l <"$tmp_dir/upstream-files" | tr -d ' ')"
printf 'overlapping files:        %s\n' "$(wc -l <"$tmp_dir/overlap-files" | tr -d ' ')"

if [[ -s "$tmp_dir/overlap-files" ]]; then
  echo
  echo 'overlap:'
  cat "$tmp_dir/overlap-files"
fi

echo
echo 'merge-tree preview:'
set +e
git merge-tree --write-tree "$downstream" "$upstream"
merge_tree_status=$?
set -e
printf 'merge-tree exit: %s\n' "$merge_tree_status"

# A conflict preview is evidence, not a script failure. Missing refs and other
# preflight errors already fail above.
exit 0
