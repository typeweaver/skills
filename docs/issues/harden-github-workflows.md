# Harden the GitHub workflows and add Dependabot

## Context

CI and release drifted: CI runs Node 22 with actions at v4, release runs
Node 24 with actions at v6, so the package is built with a toolchain CI never
tests. `ci.yml` has no `concurrency` group and no explicit `permissions`.
Actions are pinned to tags, not commit SHAs; checkouts persist credentials.
There is no dependency update automation. A local branch already holds a
commit adding `permissions: contents: read` to `ci.yml`.

## Goal

CI tests what release ships, workflows follow least privilege and SHA pinning
with an automated audit, and dependencies update themselves with a cooldown.

## Acceptance criteria

- All actions in `ci.yml` and `release.yml` pinned to full commit SHAs with a
  version comment, on the current majors (checkout v7, setup-node v7,
  pnpm/action-setup v6, changesets/action v2.1.x).
- `ci.yml`: `permissions: contents: read`, per-ref `concurrency` with
  cancel-in-progress, matrix on Node 22 and 24, `persist-credentials: false`
  on checkout.
- zizmor runs in CI and passes.
- `.github/dependabot.yml` covers `github-actions` and `npm` (pnpm catalog),
  grouped, with a 7-day cooldown; first update PRs pass CI with a consistent
  lockfile.
- Either CI runs `pnpm check` or the relation between the root check script
  and the CI jobs is documented so neither can silently drift.

## References

- `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `package.json`
- https://docs.zizmor.sh/audits/
- https://docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference
