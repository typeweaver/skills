#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
agents_dir="$repo_dir/agents"
agents_readme="$agents_dir/README.md"
top_readme="$repo_dir/README.md"
agent_count=0
status=0

report_error() {
  printf 'error: %s\n' "$1" >&2
  status=1
}

if [ ! -f "$agents_readme" ]; then
  report_error "agents/README.md is missing"
fi

while IFS= read -r -d '' agent_dir; do
  agent_count=$((agent_count + 1))
  agent_name="$(basename "$agent_dir")"
  adapter_count=0

  for adapter in codex.toml codex-profile.toml claude.md opencode.md; do
    adapter_file="$agent_dir/$adapter"
    [ -f "$adapter_file" ] || continue
    adapter_count=$((adapter_count + 1))
    relative_path="${adapter_file#"$repo_dir/"}"

    case "$adapter" in
      codex.toml)
        grep -Fq '# Managed by typeweaver/skills' "$adapter_file" || \
          report_error "$relative_path has no managed-copy marker"
        grep -Fqx "name = \"$agent_name\"" "$adapter_file" || \
          report_error "$relative_path does not declare name '$agent_name'"
        grep -q '^description[[:space:]]*=' "$adapter_file" || \
          report_error "$relative_path has no description"
        grep -q '^developer_instructions[[:space:]]*=' "$adapter_file" || \
          report_error "$relative_path has no developer_instructions"
        ;;
      codex-profile.toml)
        grep -Fq '# Managed by typeweaver/skills' "$adapter_file" || \
          report_error "$relative_path has no managed-copy marker"
        grep -q '^developer_instructions[[:space:]]*=' "$adapter_file" || \
          report_error "$relative_path has no developer_instructions"
        ;;
      claude.md)
        declared_name="$(sed -n '1,/^---$/s/^name:[[:space:]]*//p' "$adapter_file" | head -n 1)"
        if [ "$declared_name" != "$agent_name" ]; then
          report_error "$relative_path declares '$declared_name', expected '$agent_name'"
        fi
        sed -n '1,/^---$/p' "$adapter_file" | grep -q '^description:' || \
          report_error "$relative_path has no description"
        ;;
      opencode.md)
        sed -n '1,/^---$/p' "$adapter_file" | grep -q '^description:' || \
          report_error "$relative_path has no description"
        sed -n '1,/^---$/p' "$adapter_file" | grep -Eq '^mode:[[:space:]]+(primary|subagent)$' || \
          report_error "$relative_path has no supported mode"
        ;;
    esac
  done

  if [ "$adapter_count" -eq 0 ]; then
    report_error "agents/$agent_name has no harness adapter"
  fi

  if [ -f "$agents_readme" ] && ! grep -Fq "$agent_name/" "$agents_readme"; then
    report_error "agents/README.md does not link $agent_name"
  fi
  if ! grep -Fq "agents/$agent_name/" "$top_readme"; then
    report_error "README.md does not link agents/$agent_name"
  fi
done < <(find "$agents_dir" -mindepth 1 -maxdepth 1 -type d -print0)

if [ "$agent_count" -eq 0 ]; then
  report_error "no agents found"
fi

if [ "$status" -ne 0 ]; then
  exit "$status"
fi

printf 'ok: validated %d agents\n' "$agent_count"
