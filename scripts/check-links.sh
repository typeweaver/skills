#!/usr/bin/env bash
set -euo pipefail

# Verify that every URL referenced in skill source files responds successfully.
# Hosts that block automated clients but work for humans are allowlisted.

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
allowlisted_hosts=("dl.acm.org")
status=0
checked=0

is_allowlisted() {
  for host in "${allowlisted_hosts[@]}"; do
    case "$1" in
      *"$host"*) return 0 ;;
    esac
  done
  return 1
}

while IFS= read -r url; do
  checked=$((checked + 1))
  code="$(curl --silent --output /dev/null --write-out '%{http_code}' \
    --location --max-time 30 --retry 2 \
    --user-agent "Mozilla/5.0 (compatible; typeweaver-skills link check)" \
    "$url" || printf 'ERR')"
  if [ "$code" = "200" ]; then
    continue
  fi
  if is_allowlisted "$url"; then
    printf 'allowlisted (%s): %s\n' "$code" "$url"
    continue
  fi
  printf 'broken (%s): %s\n' "$code" "$url" >&2
  status=1
done < <(find "$repo_dir/skills" -name sources.md -exec \
  grep -hoE 'https?://[^) ]+' {} + | sed 's/[).,]*$//' | sort -u)

if [ "$checked" -eq 0 ]; then
  printf 'error: no URLs found\n' >&2
  exit 1
fi

if [ "$status" -ne 0 ]; then
  exit "$status"
fi

printf 'ok: %d links healthy\n' "$checked"
