#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
codex_root="${CODEX_HOME:-$HOME/.codex}"
config_root="${XDG_CONFIG_HOME:-$HOME/.config}"
codex_dir="$codex_root/agents"
codex_profile_dir="$codex_root"
claude_dir="$HOME/.claude/agents"
opencode_dir="$config_root/opencode/agents"
dry_run=false
replace_symlinks=false
replace_existing=false

usage() {
  cat <<'EOF'
Usage: scripts/link-agents.sh [--dry-run] [--replace-symlinks]
                             [--replace-existing]
                             [--codex-dir DIR]
                             [--codex-profile-dir DIR]
                             [--claude-dir DIR]
                             [--opencode-dir DIR]

Install every native agent adapter in this repository into its harness
directory. Claude Code and OpenCode use symlinks. Codex profiles and custom
agents use managed copies.

By default, existing files and directories are preserved. Existing symlinks
are preserved unless they already point to the desired adapter or
--replace-symlinks is supplied.

--replace-existing replaces any existing entry whose agent name belongs to this
repository. Reinstall or relink the previous source to restore it later.
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --dry-run)
      dry_run=true
      ;;
    --replace-symlinks)
      replace_symlinks=true
      ;;
    --replace-existing)
      replace_existing=true
      ;;
    --codex-dir|--codex-profile-dir|--claude-dir|--opencode-dir)
      option="$1"
      shift
      if [ "$#" -eq 0 ]; then
        printf 'error: %s requires a directory\n' "$option" >&2
        exit 2
      fi
      case "$option" in
        --codex-dir) codex_dir="$1" ;;
        --codex-profile-dir) codex_profile_dir="$1" ;;
        --claude-dir) claude_dir="$1" ;;
        --opencode-dir) opencode_dir="$1" ;;
      esac
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      printf 'error: unknown option: %s\n' "$1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

for destination in "$codex_dir" "$codex_profile_dir" "$claude_dir" "$opencode_dir"; do
  if [ -L "$destination" ]; then
    printf 'error: destination is a symlink, refusing to modify it: %s\n' "$destination" >&2
    exit 1
  fi
  if [ "$dry_run" = true ]; then
    printf 'would ensure directory: %s\n' "$destination"
  else
    mkdir -p "$destination"
  fi
done

adapter_count=0
status=0
while IFS= read -r -d '' source_file; do
  adapter_count=$((adapter_count + 1))
  agent_name="$(basename "$(dirname "$source_file")")"
  adapter_name="$(basename "$source_file")"

  case "$adapter_name" in
    codex.toml)
      target="$codex_dir/$agent_name.toml"
      install_mode=copy
      ;;
    codex-profile.toml)
      target="$codex_profile_dir/$agent_name.config.toml"
      install_mode=copy
      ;;
    claude.md)
      target="$claude_dir/$agent_name.md"
      install_mode=link
      ;;
    opencode.md)
      target="$opencode_dir/$agent_name.md"
      install_mode=link
      ;;
    *)
      continue
      ;;
  esac

  replace_target=false
  if [ -L "$target" ]; then
    current_source="$(readlink "$target")"
    if [ "$current_source" = "$source_file" ] && [ "$install_mode" = link ]; then
      printf 'already linked: %s -> %s\n' "$target" "$source_file"
      continue
    fi
    if [ "$current_source" = "$source_file" ] || \
      [ "$replace_existing" = true ] || [ "$replace_symlinks" = true ]; then
      replace_target=true
    else
      printf 'error: unrelated symlink exists, preserving it: %s -> %s\n' \
        "$target" "$current_source" >&2
      status=1
      continue
    fi
  elif [ -e "$target" ]; then
    if [ "$install_mode" = copy ] && cmp -s "$source_file" "$target"; then
      printf 'already synced: %s <- %s\n' "$target" "$source_file"
      continue
    fi
    if [ "$install_mode" = copy ] && \
      grep -Fq '# Managed by typeweaver/skills' "$target"; then
      replace_target=true
    elif [ "$replace_existing" = true ]; then
      replace_target=true
    else
      printf 'error: file or directory exists, preserving it: %s\n' "$target" >&2
      status=1
      continue
    fi
  fi

  if [ "$dry_run" = true ]; then
    if [ "$replace_target" = true ]; then
      if [ "$install_mode" = copy ]; then
        printf 'would replace: %s <- %s\n' "$target" "$source_file"
      else
        printf 'would replace: %s -> %s\n' "$target" "$source_file"
      fi
    elif [ "$install_mode" = copy ]; then
      printf 'would copy: %s <- %s\n' "$target" "$source_file"
    else
      printf 'would link: %s -> %s\n' "$target" "$source_file"
    fi
    continue
  fi

  if [ "$replace_target" = true ]; then
    if [ -d "$target" ] && [ ! -L "$target" ]; then
      rm -rf -- "$target"
    else
      rm -f -- "$target"
    fi
  fi
  if [ "$install_mode" = copy ]; then
    cp "$source_file" "$target"
    if [ "$replace_target" = true ]; then
      printf 'replaced: %s <- %s\n' "$target" "$source_file"
    else
      printf 'copied: %s <- %s\n' "$target" "$source_file"
    fi
  else
    ln -s "$source_file" "$target"
    if [ "$replace_target" = true ]; then
      printf 'replaced: %s -> %s\n' "$target" "$source_file"
    else
      printf 'linked: %s -> %s\n' "$target" "$source_file"
    fi
  fi
done < <(find "$repo_dir/agents" -mindepth 2 -maxdepth 2 -type f \
  \( -name codex.toml -o -name codex-profile.toml -o -name claude.md -o \
     -name opencode.md \) -print0)

if [ "$adapter_count" -eq 0 ]; then
  printf 'error: no agent adapters found\n' >&2
  exit 1
fi

exit "$status"
