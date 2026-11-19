#!/usr/bin/env bash
# Print files the diff grows past a line limit: "path: before -> after" (before 0 = new file).
# Usage: size-check.sh BASE [HEAD] [LIMIT]   HEAD omitted = working tree (includes uncommitted changes).
set -euo pipefail
base=${1:?usage: size-check.sh BASE [HEAD] [LIMIT]}
head=${2:-}
limit=${3:-1000}

count() { { git show "$1:$2" 2>/dev/null || true; } | wc -l | tr -d ' '; } # missing at that ref = 0

if [ -n "$head" ]; then range=("$base" "$head"); else range=("$base"); fi
# Renames list the old path first, so a moved file is measured against its old size. Copies count as new.
git diff --name-status --diff-filter=AMRC "${range[@]}" | while IFS=$'\t' read -r status old f; do
  [ -n "$f" ] || f=$old
  [[ $status == C* ]] && old=$f
  before=$(count "$base" "$old")
  if [ -n "$head" ]; then after=$(count "$head" "$f"); else after=$(wc -l <"$f" | tr -d ' '); fi
  if [ "$after" -gt "$limit" ]; then
    flag=$([ "$before" -le "$limit" ] && echo "  CROSSED" || echo "")
    echo "$f: $before -> $after$flag"
  fi
done

# Working-tree mode: new untracked files are part of the change too.
if [ -z "$head" ]; then
  git ls-files --others --exclude-standard | while IFS= read -r f; do
    after=$(wc -l <"$f" | tr -d ' ')
    if [ "$after" -gt "$limit" ]; then echo "$f: 0 -> $after  CROSSED (untracked)"; fi
  done
fi
