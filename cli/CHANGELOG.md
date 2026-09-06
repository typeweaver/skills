# skill-it

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
