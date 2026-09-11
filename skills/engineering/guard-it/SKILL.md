---
name: guard-it
description: Set up or tighten machine-enforced quality gates in a TypeScript
  project, from compiler strictness, type-aware lint, complexity limits,
  dead-code and dependency checks, module boundaries, and supply-chain and
  packaging checks to custom repository invariants, and prove each gate fails
  CI on a real violation. Use when asked to harden a repository, add or
  strengthen any of those checks, make a rule block merges instead of warn, or
  confirm that a configured check actually fires. Not for JavaScript-only
  projects, routine implementation, or merely running existing checks.
---

# Guard It

Turn the repository's quality expectations into checks that fail CI, prove
each one fires, then record them where agents read instructions. Static
analysis catches defined defect shapes and limits complexity drift; it does not
judge ownership or abstractions. Discover the toolchain and the repository's
own policy before prescribing anything; never copy another repository's
configuration. Read [references/guardrails.md](references/guardrails.md)
before proposing settings: it holds the per-layer flags, rule priorities, tool
choices, and version caveats.

## Discover first

1. Inventory package manager and lockfile, TypeScript version, linter,
   formatter, test runner, CI provider, monorepo layout, framework, existing
   verification scripts, and any `AGENTS.md`, `CLAUDE.md`, or equivalent agent
   instructions.
2. Read every existing check and its current results. Read installed versions
   instead of assuming defaults; strictness baselines move between major
   versions.
3. Count violations before proposing a rule. A rule that fails on thousands of
   lines needs a ratchet plan, not a switch.

## Propose the guardrail set

For each layer, propose the strictest setting the codebase can adopt now and
name what it prevents. Skip a layer only with a stated reason.

- **Compiler.** Strict-family flags and an explicit `types` list.
- **Type-aware lint.** One linter in typed mode, prioritizing the rules that
  catch agent-written defects. Make the linter fail on inline disable
  directives, or ignore them, rather than trusting a reason comment.
- **Complexity.** Cognitive complexity, not only cyclomatic. Set thresholds
  from the tool default and the codebase's current distribution, and reject
  extractions that exist only to lower a score.
- **Framework analyzers.** Official presets, pinned compatible versions, and
  exactly one owner per diagnostic: compiler or linter, never both.
- **Format.** One formatter in check mode in CI, matched to the linter family.
- **Dead code and dependencies.** Unused files, exports, and dependencies, in
  the mode that does not silently skip devDependencies.
- **Module boundaries.** Cycles, orphans, and forbidden import directions.
  Use the restricted-import rules of the linter already in place before adding
  a dependency tool. Encode the boundaries the repository already intends; do
  not invent an architecture.
- **Repository invariants.** When no tool encodes an invariant the repository
  relies on, write the guard: a small script over the source graph, an
  ownership ledger, or the emitted bundle, run by the same root check.
- **Supply chain.** Install-delay and dependency-build restrictions,
  lockfile-only installs in CI, and pinned, audited CI workflow actions.
- **Published packages.** Packaging validation and a packed-tarball smoke test
  installed with npm, not only the workspace package manager.

## Prove enforcement

A green check is not proof. For every compiler profile and every new or
tightened rule:

1. Run a positive probe that must pass and a negative probe that must fail with
   the expected diagnostic code or rule id. Write fixtures inside the
   repository in an ignored directory so type roots, plugins, and the project
   service resolve as they do for `src/`, and lint them with ignores disabled.
   Probes are the proof; printed configuration shows only explicit options.
2. Keep those probes as a test in the repository, then silence one rule,
   confirm the probe fails, and restore it.
3. For install-time and CI-layer guards that cannot fire offline, assert the
   configuration in the same test, label it as a configuration assertion, and
   record the one observed firing in the report.

## Wire it in

- Add every check, including the probes, to one root script that CI runs, so
  "the check" has one owner. Confirm CI runs exactly that script and fails on
  violations; warnings do not change behavior. Tools outside the package
  manager run as a separate CI job, with the local equivalent documented next
  to the root command.
- Fix existing violations in the same change when they are few; otherwise
  enable the rule, baseline the current violations, and fail on growth.
- Record the guardrails in the repository's agent instructions, creating
  `AGENTS.md` when none exists: what runs, how to run it locally, that
  disabling a rule requires a stated reason in the same change, and a register
  of accepted exceptions with their rationale.

## Report

State the toolchain found, each guardrail added or tightened with its reason
and starting violation count, what was skipped and why, the proof that each
new rule fires, and the one command that reproduces CI locally. Hand back with
the gate green or list every violation that keeps it red.
