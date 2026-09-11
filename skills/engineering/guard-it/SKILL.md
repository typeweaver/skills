---
name: guard-it
description: Set up or tighten machine-enforced compiler, analysis,
  architecture, and supply-chain constraints in a TypeScript project so
  detectable defects and complexity drift fail fast. Use when asked to harden a
  project, add or strengthen strictness, linting, dead code detection, module
  boundaries, or supply-chain checks, or when a project has no such gates yet.
  Not for JavaScript-only projects or everyday implementation.
---

# Guard It

Everything a machine enforces, nobody has to remember. Turn the project's
quality expectations into checks that fail in CI, prove that each check
fires, then record them where agents read instructions. Static analysis
catches defined defect shapes and limits complexity drift; it does not judge
ownership or abstractions. Propose with reasons, discover before prescribing,
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
- **Type-aware lint.** Prefer oxlint with `oxlint-tsgolint` when its typed and
  ecosystem rule coverage satisfies the repository's existing policy;
  otherwise keep and strengthen the established linter, typically
  typescript-eslint `strict-type-checked`. Turn on the rules that catch
  agent-written defects first: floating and misused promises, unsafe `any`
  flows, strict boolean expressions, exhaustive switches, unused declarations
  and directives, consistent type imports, `max-lines`, and no inline disables
  without a reason.
- **Complexity.** Limit cognitive complexity (nesting and readability), not
  only cyclomatic complexity (control paths). Set thresholds from the tool's
  default and the codebase's current distribution, and reject extractions that
  exist only to lower a score.
- **Framework analyzers.** Detect library-specific static analyzers and
  language-service plugins, use their official presets, pin mutually
  compatible versions, and give every diagnostic exactly one owner, compiler
  or linter, never both.
- **Format.** One formatter in check mode in CI: oxfmt with oxlint, prettier
  with the typescript-eslint family.
- **Dead code and dependencies.** knip for unused files, exports, and
  dependencies. Use `--production --strict` for published libraries; use the
  default mode for applications, because production mode skips
  devDependencies and weakens the gate.
- **Module boundaries.** dependency-cruiser or the project's equivalent for
  cycles, orphans, and forbidden import directions between layers or
  features. Encode the boundaries the repository already intends; do not
  invent an architecture.
- **Supply chain.** pnpm `minimumReleaseAge` (minutes) and `strictDepBuilds`
  with `allowBuilds` entries written by `pnpm approve-builds`, checked against
  the installed pnpm version (older releases use `onlyBuiltDependencies`), or
  the package manager's equivalent; lockfile-only installs in CI; SHA-pinned
  CI actions audited by zizmor when GitHub Actions workflows exist. zizmor is
  not an npm package: run it through its pinned action or `pipx`.
- **Published packages.** publint and a packed-tarball smoke test that
  installs with npm, not only the workspace package manager.

## Prove enforcement

A green check is not proof. For every compiler profile and every new or
tightened rule:

1. Print the effective configuration (`tsc --showConfig`, the linter's
   resolved config) and confirm the intended files, profile, and type-aware
   mode are loaded.
2. Run a positive probe that must pass and a negative probe that must fail
   with the expected diagnostic code or rule id, in a throwaway fixture.
3. Keep those probes as a test in the repository so a later configuration
   change that silences a rule fails CI.
4. Confirm CI runs exactly the root check that contains the probes.

## Wire it in

- Add every check to one root script that CI runs, so the definition of "the
  check" has one owner. Make CI fail on violations; warnings do not change
  behavior.
- Run the fast checks in a pre-commit hook only when the repository already
  uses hooks; never make hooks the only gate.
- Decide what to do with existing violations: fix them in the same change when
  they are few, otherwise enable the rule, record the current violations in a
  baseline, and fail on growth. Hand back with the gate green, or list every
  violation that keeps it red.
- Record the guardrails in the repository's agent instructions, creating
  `AGENTS.md` when none exists: what runs, how to run it locally, and that
  disabling a rule requires a stated reason in the same change. Where the
  repository supports it, protect the compiler and lint configuration with a
  CODEOWNERS entry or a harness deny rule.

## Report

State the toolchain found, each guardrail added or tightened with the reason
and the violation count it started from, what was deliberately skipped and
why, and the single command that reproduces CI locally.
