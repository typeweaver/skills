---
name: guard-it
description: Set up or tighten machine-enforced guardrails in a TypeScript or
  JavaScript project so agents and humans are forced to write clean code. Use
  when asked to harden a project, add or strengthen strictness, linting, dead
  code detection, module boundaries, or supply-chain checks, or when a project
  has no such gates yet. Do not use for everyday implementation.
---

# Guard It

Everything a machine enforces, nobody has to remember. Turn the project's
quality expectations into checks that fail in CI, then record them where
agents read instructions. Propose with reasons, discover before prescribing,
and never copy another repository's configuration.

## Discover first

1. Inventory the toolchain: package manager and lockfile, TypeScript version,
   existing linter, formatter, test runner, CI provider, monorepo layout,
   framework, and any `AGENTS.md`, `CLAUDE.md`, or equivalent instructions.
2. Read every existing check and its current results. Count violations before
   proposing a rule; a rule that fails on thousands of lines needs a ratchet
   plan, not a switch.
3. Detect the strictness baseline. TypeScript 7 defaults to `strict: true`,
   `types: []`, and `rootDir: "./"` and removes `baseUrl`; older versions do not.
   Read the installed version instead of assuming.
4. Respect organization and team policy found in the repository. Discover it;
   do not invent it.

## Propose the guardrail set

For each layer, propose the strictest setting the codebase can adopt now and
name what it prevents. Skip a layer only with a stated reason.

- **Compiler.** `strict` plus `exactOptionalPropertyTypes`,
  `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`,
  `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`,
  `isolatedModules`, and an explicit `types` list. Prefer the project
  references or `include` scope that keeps type-aware tools fast.
- **Type-aware lint.** On TypeScript 7 prefer oxlint with `oxlint-tsgolint`;
  otherwise typescript-eslint `strict-type-checked`. Turn on the rules that
  catch agent-written defects first: floating and misused promises, unsafe
  `any` flows, strict boolean expressions, exhaustive switches, unused
  declarations and directives, consistent type imports, `max-lines` and
  complexity limits, no inline disables without a reason.
- **Format.** One formatter, run in check mode in CI. Prefer the formatter that
  matches the linter family already in use.
- **Dead code and dependencies.** knip for unused files, exports, and
  dependencies, in `--production --strict` mode where the project allows.
- **Module boundaries.** dependency-cruiser or the project's equivalent for
  cycles, orphans, and forbidden import directions between layers or
  features. Encode the boundaries the repository already intends; do not
  invent an architecture.
- **Supply chain.** pnpm `minimumReleaseAge` (or the package manager's
  equivalent), lockfile-only installs in CI, scripts disabled unless
  allowlisted, and SHA-pinned CI actions audited by zizmor when GitHub Actions
  workflows exist.
- **Published packages.** publint and a packed-tarball smoke test that
  installs with npm, not only the workspace package manager.

## Wire it in

- Add every check to one root script that CI runs, so the definition of "the
  check" has one owner. Make CI fail on violations; warnings do not change
  behavior.
- Run the fast checks in a pre-commit hook only when the repository already
  uses hooks; never make hooks the only gate.
- Ratchet where needed: enable a rule, allowlist the existing violations with a
  count or a baseline file, and fail on growth.
- Record the guardrails in the repository's agent instructions: what runs,
  how to run it locally, and that disabling a rule requires a stated reason in
  the same change. Protect the lint and compiler configuration from casual
  edits when the harness supports it.

## Report

State the toolchain found, each guardrail added or tightened with the reason
and the violation count it started from, what was deliberately skipped and
why, and the single command that reproduces CI locally.
