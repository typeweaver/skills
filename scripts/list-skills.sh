#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"

while IFS= read -r skill_file; do
  skill_dir="$(dirname "$skill_file")"
  skill_name="$(basename "$skill_dir")"
  relative_path="${skill_file#"$repo_dir/"}"
  printf '%s\t%s\n' "$skill_name" "$relative_path"
done < <(find "$repo_dir/skills" -name SKILL.md -type f | sort)
