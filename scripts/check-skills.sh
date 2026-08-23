#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
top_readme="$repo_dir/README.md"
skill_count=0
status=0
seen_names=()

report_error() {
  printf 'error: %s\n' "$1" >&2
  status=1
}

while IFS= read -r -d '' skill_file; do
  skill_count=$((skill_count + 1))
  skill_dir="$(dirname "$skill_file")"
  directory_name="$(basename "$skill_dir")"
  bucket_dir="$(dirname "$skill_dir")"
  bucket_readme="$bucket_dir/README.md"
  relative_path="${skill_file#"$repo_dir/"}"

  declared_name="$(sed -n 's/^name:[[:space:]]*//p' "$skill_file" | head -n 1)"
  if [ -z "$declared_name" ]; then
    report_error "$relative_path has no frontmatter name"
  elif [ "$declared_name" != "$directory_name" ]; then
    report_error "$relative_path declares '$declared_name', expected '$directory_name'"
  fi

  if ! sed -n '1,/^---$/p' "$skill_file" | grep -q '^description:'; then
    report_error "$relative_path has no frontmatter description"
  fi

  for seen_name in "${seen_names[@]-}"; do
    if [ -n "$declared_name" ] && [ "$declared_name" = "$seen_name" ]; then
      report_error "duplicate skill name '$declared_name'"
    fi
  done
  seen_names+=("$declared_name")

  metadata_file="$skill_dir/agents/openai.yaml"
  if [ ! -f "$metadata_file" ]; then
    report_error "$relative_path is missing agents/openai.yaml"
  else
    grep -q '^[[:space:]]*display_name:' "$metadata_file" || \
      report_error "${metadata_file#"$repo_dir/"} has no display_name"
    grep -q '^[[:space:]]*short_description:' "$metadata_file" || \
      report_error "${metadata_file#"$repo_dir/"} has no short_description"
  fi

  if [ ! -f "$bucket_readme" ]; then
    report_error "${bucket_dir#"$repo_dir/"} has no README.md"
  elif ! grep -Fq "$directory_name/SKILL.md" "$bucket_readme"; then
    report_error "${bucket_readme#"$repo_dir/"} does not link $directory_name"
  fi

  if ! grep -Fq "$relative_path" "$top_readme"; then
    report_error "README.md does not link $relative_path"
  fi
done < <(find "$repo_dir/skills" -name SKILL.md -type f -print0)

if [ "$skill_count" -eq 0 ]; then
  report_error "no skills found"
fi

if [ "$status" -ne 0 ]; then
  exit "$status"
fi

printf 'ok: validated %d skills\n' "$skill_count"
