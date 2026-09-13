---
name: guard-it
description: Set up or tighten the automated checks that fail CI in a
  TypeScript project and prove each one fires on a real violation. Use when
  asked to harden a repository, make the compiler or linter stricter, add lint,
  dead-code, dependency, module-boundary, or supply-chain checks, turn a warning
  into a merge blocker, or confirm that a configured check actually fails. Not
  for JavaScript-only projects, fixing what an existing check already reports,
  or implementing features.
---

# Guard It

A guardrail is a check that CI runs and that has been shown to fail on a real
violation; a check that cannot fire offline is labeled a configuration
assertion; anything else is configuration. Turn the repository's quality
expectations into guardrails, then record them where agents read instructions.
Static analysis catches defined defect shapes and complexity drift; leave
ownership and abstraction judgments to review. Discover the toolchain and the
repository's own policy before proposing anything; never copy another
repository's configuration.

## Discover first

1. Inventory the toolchain: package manager and lockfile, TypeScript version,
   linter, formatter, test runner, CI provider, monorepo layout, framework,
   verification scripts, and agent instructions (`AGENTS.md`, `CLAUDE.md`, or
   equivalent).
2. Run every existing check and read its results. Read installed versions
   instead of assuming defaults; strictness baselines move between major
   versions.
3. Count violations before proposing a rule; Wire it in decides whether to fix
   them now or baseline the count.

## Propose the guardrail set

Read [references/guardrails.md](references/guardrails.md) first: it holds the
per-layer flags, rule priorities, tool choices, and version caveats. For each
layer, propose the strictest setting the codebase can adopt now and name what
it prevents. Skip a layer only with a stated reason.

- **Compiler.** Strict-family flags and an explicit `types` list.
- **Type-aware lint.** One linter in typed mode, prioritizing the rules that
  catch agent-written defects. Configure it to fail on inline disable
  directives or not to honor them; a reason comment is not a gate.
- **Complexity.** Cognitive complexity, not only cyclomatic, from the tool
  default and the codebase's current distribution. A threshold is too tight
  when meeting it needs an extraction whose only caller is the function it left
  and whose name describes a position (`handleRest`, `step2`) rather than a
  concept: that lowers the score and nothing else. Raise the threshold with a
  stated reason or leave the function in the baseline.
- **Framework analyzers.** Official presets, pinned compatible versions, and
  exactly one owner per diagnostic: compiler or linter, never both.
- **Format.** One formatter in check mode in CI, matched to the linter family.
- **Dead code and dependencies.** Unused files, exports, and dependencies, in
  the mode that does not silently skip devDependencies.
- **Module boundaries.** Cycles, orphans, and forbidden import directions.
  Use the restricted-import rules of the linter already in place before adding
  a dependency tool. A boundary is intended when the repository documents it
  or the import graph already follows it; anything else is an architecture
  proposal for the report, not a rule.
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
   the expected diagnostic code or rule id. Keep the fixtures inside the
   repository, in a directory the root check excludes, so type roots, plugins,
   and the project service resolve as for `src/`; run the probes with that
   exclusion lifted. Printed configuration shows only explicit options and
   proves nothing.
2. Keep the probes as a test in the repository, then silence one rule, confirm
   the probe fails, and restore it.
3. For install-time and CI-layer guards that cannot fire offline, assert the
   configuration in the same test and label it a configuration assertion. The
   report says which guards were observed firing and which rest on an
   assertion.

## Wire it in

- Add every check, including the probes, to one root script that CI runs, so
  "the check" has one owner. Confirm CI runs exactly that script and fails on
  violations; a warning changes nothing. Tools outside the package manager run
  as a separate CI job, with the local equivalent documented next to the root
  command.
- Fix existing violations in the same change only when the tool's autofix
  produces the whole change and it changes no runtime behavior; otherwise
  enable the rule, baseline the current count, and fail on growth.
- Record the guardrails in the repository's agent instructions: what runs and
  how to run it locally. When no such file exists, propose creating `AGENTS.md`
  with that content and wait for the answer before creating it. Recommend, and
  let the repository decide, a stated-reason requirement for disabling a rule
  and a register of accepted exceptions.

## Report

State the toolchain found, each guardrail added or tightened with its reason
and starting violation count, what was skipped and why, the proof that each
new rule fires, and the one command that reproduces CI locally. Hand back with
the root check green or list every violation that keeps it red.
