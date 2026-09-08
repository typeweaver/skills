# CLI 0.1.2: clean expected errors, consistent `--yes`, minified bundle

## Context

Acceptance testing of 0.1.1 found two UX defects. An expected conflict (a
foreign file at a managed path, no `--force`) prints the correct message but
follows it with nine lines of Effect stack trace from the runtime's default
error reporting. `--yes` exists only on `install`; `update` and `uninstall`
reject it with "Unrecognized flag" although they never prompt. The bundle is
1.2 MB; tsdown's full minification brings it to about 360 kB, which was held
back only because minified stack traces would be unreadable.

## Goal

Expected errors are two lines and exit 1; `--yes` is accepted everywhere as a
no-op where nothing prompts; the bundle is minified; all shipped as 0.1.2.

## Acceptance criteria

- `NodeRuntime.runMain` runs with default error reporting disabled; tagged
  domain errors (`ConflictError`, `LifecycleError`, and the other tagged errors
  in `cli/src/errors.ts`) print only their message to stderr and exit 1;
  unknown defects still print the full cause.
- Unit test covers the error rendering for at least one expected and one
  unexpected error.
- `equip-it update --yes` and `equip-it uninstall --yes` run; `cli/README.md`
  states that only `install` prompts.
- `cli/tsdown.config.ts` uses `minify: true`; size before and after recorded
  in the PR; `node scripts/check-cli-package.mjs` and the roundtrip matrix
  pass.
- Patch changeset.

## References

- `cli/src/bin.ts`, `cli/src/cli.ts`, `cli/src/commands/report.ts`,
  `cli/src/errors.ts`
- `cli/tsdown.config.ts`
