---
name: craft-it
description: Implement, fix, or refactor code once the outcome is agreed. Use
  when asked to build a feature, add or change behavior, fix a bug, or carry
  out a plan step, and the result must be ready for review. Not for spikes or
  throwaway prototypes, for moving code without changing behavior, or for
  reviewing a change.
---

# Craft It

Build the smallest complete change for the agreed outcome. Smallest: nothing
the agreed outcome does not need. Complete: every input and failure path of the
agreed outcome is handled and tested. Leave the change verified; do not plan,
review, commit, or deliver it here.

## Establish the change

1. Read the repository instructions, the plan file if one exists, the
   neighboring code, and the check command CI runs.
2. Follow the pattern the neighboring code uses, even where you would choose
   differently. Deviate only when the pattern cannot produce the agreed
   outcome; then apply the deviation to every file you touch and report the
   untouched files as a follow-up.
3. Research and decide implementation details yourself. Ask only when new
   evidence invalidates the agreed outcome, when a step needs authority you do
   not have, or before an action you cannot undo.

## Honor an approved scaffold

When the agreed outcome has an approved scaffold, read its plan and every
`@scaffold` marker before editing. Use its ownership, architecture-bearing file
roles, boundary-crossing dependencies, public contracts, and test intent as the
reviewed baseline, not an exhaustive prescription. Preserve that baseline by
default. The scaffolded file list is not an allowlist: add private helper files,
local types, internal modules, and additional tests wherever they fit the
approved outcome.

Implementation reveals constraints a plan cannot predict. When evidence shows
that a different structure is simpler or more correct, make the smallest
coherent deviation and record it under `Scaffold deviations`: the reviewed
decision, its replacement, the evidence, and the affected contracts and tests.
Never hide structural drift as an implementation detail. Stop only when the
deviation changes the agreed outcome or scope, requires new authority, or
introduces serious irreversible risk; otherwise implement it for review.

Replace each marker with working behavior, an active test, or durable
documentation. The implementation is incomplete while a search within its
scope still finds `@scaffold`, or while a planned test has neither an active
case nor a recorded `Scaffold deviations` entry explaining why it changed or
was removed.

Run the final literal marker search after updating the plan and report. Do not
quote the marker token in tracked completion notes: a sentence claiming none
remain otherwise recreates the marker it reports as removed.

## Shape the code

- Extract or share code only when deleting it would move duplicated logic back
  into two or more callers. An extraction whose only caller is the function it
  left, named for a position (`step2`, `handleRest`) rather than a concept,
  goes back inline.
- Export only what a caller outside the module uses, and keep third-party
  types out of exported signatures. Document an exported contract in the form
  the repository already uses.
- Place new code with the concept that owns it. When the existing structure no
  longer matches responsibilities, restructure with `shape-it` in its own
  commit instead of adding to the drift.
- Add a dependency only with a stated reason in the change; prefer what the
  repository already has.
- Write comments and documentation for the code at HEAD. A comment that names
  a reviewer, the conversation, a plan step, "now", or "previously" narrates
  history: state the constraint instead, or delete it. Delete documentation
  your change made false.

## Test the contract

- Every input and failure path of the agreed outcome has a test that fails
  without your change. A test that passes on the old code tests nothing.
- Exercise each changed public entry point through the import or export path its
  callers use. A direct-module test does not prove the package surface works.
- A test that breaks on a refactor that changed no behavior tests the
  implementation; rewrite it against the contract. Asserting how often an
  internal collaborator was called is that test.
- Keep domain logic in pure functions and effects at the edge, so tests reach
  the logic without mocks. Mock only a boundary you cannot control. A test that
  reads the real clock, randomness, or network, or depends on test order, is
  not deterministic: inject the value it reads.

## Hold the scope

A pre-existing defect, performance concern, or behavior the task does not
mention is a follow-up in your report, not a change, unless the agreed outcome
cannot work without it. A hunk in the diff that the agreed outcome does not
need is scope creep: revert it and report what prompted it as a follow-up.

## Finish

1. Run the check command CI runs, not only the tests you touched.
2. Read the complete diff for scope creep and debug output.
3. If a plan file exists, record in it every decision where you chose between
   workable alternatives, every permitted deviation from the plan, and each
   check you ran with its result. For an approved scaffold, append material
   differences under `Scaffold deviations` so the reviewed baseline remains
   legible. Otherwise put the same in the report; create no new file.
4. Report what changed, those decisions, the checks with their results, the
   abstractions you left out with the condition that would justify adding them
   ("skipped X, add when Y"), and the follow-ups, so that a reviewer with the
   repository and the report alone can judge the change.
