# equip-it

## 0.1.2

### Patch Changes

- efbb0a9: Print expected outcomes such as conflicts, missing receipts, and adapter drift
  as plain messages without a stack trace, accept `--yes` on `update` and
  `uninstall` for consistency, and ship a minified bundle.
- 9ee40af: Revise `nextjs-feature-architecture`: shallow-routing and mutation-transport rules, sharper cookie and static-shell guidance, a review output contract, and a shorter body.

## 0.1.1

### Patch Changes

- d1957a5: Ship the CLI as a single bundled file with no runtime dependencies, so
  `npx equip-it` no longer depends on how the consumer's package manager
  resolves the effect packages.
- 658a04d: Fix the crash on startup when installed with npm or npx. The exact `effect`
  pin conflicted with the peer ranges of `@effect/platform-node`'s transitive
  packages, so npm nested a second `effect` copy and the two runtimes could not
  share scopes. The effect packages now use compatible ranges, and the package
  smoke test installs with npm and asserts a single `effect` copy.

## 0.1.0

### Minor Changes

- c644a54: Add `comment-it`, a compact source-comment skill that preserves durable
  rationale and contracts while removing narration, change history, and stale
  commentary.
- cc1ce2a: Initial release: guided installer for Typeweaver Skills. Detects Claude Code,
  Codex, OpenCode, and Kiro, installs bundled skills and agents with
  transactional conflict-safe semantics, and supports `install`, `update`,
  `doctor`, `uninstall`, and `generate` — interactively for humans and
  flag-driven for automation. Exact existing content is adopted; replacing or
  removing conflicting selected components requires explicit `--force`.

### Patch Changes

- db408ea: Keep the Next.js feature architecture an ownership model with evolutionary
  growth, explicit feature and domain dependency direction, correct Cache
  Components invalidation and refresh semantics, and optional scenarios that
  start from a composition root.
