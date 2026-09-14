---
name: craft-it
description: Implement, fix, or refactor code once the outcome is agreed. Use
  when asked to build a feature, add or change behavior, fix a bug, or carry
  out a plan step, and the result must be ready for review. Not for spikes or
  throwaway prototypes, for restructuring code without changing behavior, or
  for reviewing a change.
---

# Craft It

Build the smallest complete change for the agreed outcome. Smallest: nothing
the agreed outcome does not need. Complete: every input and failure path of the
agreed outcome is handled, and every one the change adds or changes is tested.
Leave the change verified; do not plan, review, commit, or deliver it here.

## Establish the change

1. Read the repository instructions, the plan file if one exists, the
   neighboring code, and the check command CI runs or the verification
   commands the repository documents.
2. Follow the repository instructions first, then the pattern the neighboring
   code uses, even where you would choose differently. Deviate only when the
   pattern cannot produce the agreed outcome; then apply the deviation to every
   file you touch and report the untouched files as a follow-up.
3. Research and decide implementation details yourself. Ask only when new
   evidence invalidates the agreed outcome, when a step needs authority you do
   not have, or before an action you cannot undo.

## Shape the code

- Extract or share code only when deleting it would move duplicated logic back
  into two or more callers, or when a test cannot reach the logic without a
  mock and the extraction removes that mock. Logic a test already reaches
  without a mock is not by itself a reason to extract it. An extraction whose
  only caller is the function it left, named for a position (`step2`,
  `handleRest`) rather than a concept, goes back inline.
- Export only what a caller outside the module uses, and keep third-party
  types out of exported signatures. Document an exported contract in the form
  the repository already uses.
- Place new code with the concept that owns it. When the existing structure
  does not match responsibilities, report the drift as a follow-up, or call the
  Skill tool with `shape-it` when the user asks for the restructuring.
- Add a dependency only with a stated reason in the change; prefer what the
  repository already has.
- Write comments and documentation for the code at HEAD. A comment that names
  a reviewer, the conversation, a plan step, "now", or "previously" narrates
  history: state the constraint instead, or delete it. Delete documentation
  your change made false.

## Test the contract

- Every input and failure path the change adds or changes has a test that
  fails without your change; for a refactor, the existing tests pass unchanged
  before and after. A new parameter with a default does both: the existing
  tests pass unchanged, and the parameter gets its own test that fails without
  it.
- A test that breaks on a refactor that changed no behavior tests the
  implementation; delete it or rewrite it against the contract. Asserting how
  often an internal collaborator was called is that test.
- Keep domain logic in pure functions and effects at the edge, so tests reach
  the logic without mocks. Mock only a boundary you cannot control. A test that
  reads the real clock, randomness, or network, or depends on test order, is
  not deterministic: inject the value it reads.

## Hold the scope

A pre-existing defect, performance concern, or behavior the task does not
mention is a follow-up in your report, not a change, unless the agreed outcome
cannot work without it. A hunk in the diff that the agreed outcome does not
need is scope creep: revert it and report what prompted it as a follow-up. A
hunk that keeps a file you touched consistent with the pattern or deviation
you applied is part of the agreed outcome, not scope creep.

## Finish

1. Run the check command CI runs or the verification commands the repository
   documents, not only the tests you touched. When the check cannot run, say
   why, name what you verified instead, and label the change unverified.
2. Read the complete diff for scope creep and debug output.
3. If a plan file exists, record in it every decision where you chose between
   workable alternatives, every deviation from the plan, and each check you
   ran with its result. Otherwise put the same in the report; create no new
   file.
4. Report what changed, those decisions, the checks with their results, the
   abstractions you left out with the condition that would justify adding them
   ("skipped X, add when Y"), and the follow-ups, so that a reviewer with the
   repository and the report alone can judge the change.
