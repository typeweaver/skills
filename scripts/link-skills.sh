#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
dry_run=false
replace_symlinks=false
replace_existing=false
destinations=()

usage() {
  cat <<'EOF'
Usage: scripts/link-skills.sh [--dry-run] [--replace-symlinks]
                             [--replace-existing] [DEST ...]

Link every skill in this repository into agent skill directories.

With no DEST arguments, the defaults are:
  ~/.agents/skills
  ~/.claude/skills

By default, existing files and directories are preserved. Existing symlinks
are preserved unless they already point to the desired skill or
--replace-symlinks is supplied.

--replace-existing replaces any existing entry for a skill owned by this
repository, including directories installed by another tool. Reinstall the
published skill to restore that version later.
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
    --help|-h)
      usage
      exit 0
      ;;
    --)
      shift
      while [ "$#" -gt 0 ]; do
        destinations+=("$1")
        shift
      done
      break
      ;;
    -*)
      printf 'error: unknown option: %s\n' "$1" >&2
      usage >&2
      exit 2
      ;;
    *)
      destinations+=("$1")
      ;;
  esac
  shift
done

if [ "${#destinations[@]}" -eq 0 ]; then
  destinations=("$HOME/.agents/skills" "$HOME/.claude/skills")
fi

names=()
sources=()
while IFS= read -r -d '' skill_file; do
  source_dir="$(dirname "$skill_file")"
  skill_name="$(basename "$source_dir")"

  for existing_name in "${names[@]-}"; do
    if [ "$skill_name" = "$existing_name" ]; then
      printf 'error: duplicate skill directory name: %s\n' "$skill_name" >&2
      exit 1
    fi
  done

  names+=("$skill_name")
  sources+=("$source_dir")
done < <(find "$repo_dir/skills" -name SKILL.md -type f -print0)

if [ "${#names[@]}" -eq 0 ]; then
  printf 'error: no skills found in %s/skills\n' "$repo_dir" >&2
  exit 1
fi

status=0
for destination in "${destinations[@]}"; do
  if [ -L "$destination" ]; then
    printf 'error: destination is a symlink, refusing to modify it: %s\n' "$destination" >&2
    status=1
    continue
  fi

  if [ "$dry_run" = true ]; then
    printf 'would ensure directory: %s\n' "$destination"
  else
    mkdir -p "$destination"
  fi

  for index in "${!names[@]}"; do
    skill_name="${names[$index]}"
    source_dir="${sources[$index]}"
    target="$destination/$skill_name"
    replace_target=false

    if [ -L "$target" ]; then
      current_source="$(readlink "$target")"
      if [ "$current_source" = "$source_dir" ]; then
        printf 'already linked: %s -> %s\n' "$target" "$source_dir"
        continue
      fi
      if [ "$replace_existing" = true ] || [ "$replace_symlinks" = true ]; then
        replace_target=true
      else
        printf 'error: unrelated symlink exists, preserving it: %s -> %s\n' \
          "$target" "$current_source" >&2
        status=1
        continue
      fi
    elif [ -e "$target" ]; then
      if [ "$replace_existing" = true ]; then
        replace_target=true
      else
        printf 'error: file or directory exists, preserving it: %s\n' "$target" >&2
        status=1
        continue
      fi
    fi

    if [ "$dry_run" = true ]; then
      if [ "$replace_target" = true ]; then
        printf 'would replace: %s -> %s\n' "$target" "$source_dir"
      else
        printf 'would link: %s -> %s\n' "$target" "$source_dir"
      fi
    else
      if [ "$replace_target" = true ]; then
        if [ -d "$target" ] && [ ! -L "$target" ]; then
          rm -rf -- "$target"
        else
          rm -f -- "$target"
        fi
      fi
      ln -sfn "$source_dir" "$target"
      if [ "$replace_target" = true ]; then
        printf 'replaced: %s -> %s\n' "$target" "$source_dir"
      else
        printf 'linked: %s -> %s\n' "$target" "$source_dir"
      fi
    fi
  done
done

exit "$status"
