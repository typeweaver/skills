---
name: plan-it
description: Write the plan another agent implements from, with ordered steps, a
  check that proves each step done, and the decisions behind them. Use when the
  approach is settled and the work spans several steps or sessions, or when it
  splits into milestones that ship separately. Not for shaping an unclear idea,
  for sprint or capacity planning, or for work that fits in one step.
---

# Plan It

Turn the shared understanding into a plan file another agent executes without
reconstructing this conversation. Plan changes to the system and the evidence
that each one landed. A step whose title is a process action — create a branch,
commit, open a pull request, request review — is workflow around the work:
delete it.

## Establish the facts

1. Read the shared understanding, the repository's instructions, the plans this
   work touches, and the check command CI runs or the verification commands the
   repository documents.
2. Answer yourself every question the repository, its documentation, or the
   environment can answer. Ask the user only when a missing decision changes
   which steps exist, the scope boundary, or a choice that is expensive to
   reverse, and then ask at their decision level with one recommended answer
   they can accept or reject.

## Record the decisions

Record every decision where two workable alternatives existed: the one chosen,
why the other lost, and what the choice forces in implementation. Where a choice
rests on an assumption you did not verify, add the observation that would
reverse it.

A decision entry that narrates the conversation — "we first considered", "you
then said" — is replay. State the choice, the alternative it beat, and the
consequence.

## Shape the work

- Give each step an outcome and end it with `Done when:` and a check the
  executor can run: a command, a file that exists, a test that passes.
  "Reviewed", "looks right", or "works as expected" is not a check.
- After every step the repository's checks pass — the check command CI runs or
  the verification commands the repository documents. A step that leaves them
  broken merges with the next step.
- Order steps so each one can run when it starts: a step follows the step that
  creates what it changes or what its check reads. Steps with no such relation
  stay in any order; do not invent a sequence.
- When a decision cannot be made from what you read, make the research its own
  step, and name the decision it unlocks and the observation that settles it.
- Validate at the end across behavior, the regressions this change could cause,
  and every document or operational setting the change makes false.
- Cut milestones as tracer bullets: each carries one narrow case end to end
  through every layer the full outcome touches, so the system runs after it.
  Use expand-contract — add the new path, migrate the callers, remove the old —
  only for a refactor whose mechanical change is too wide to slice by case.
- When outcomes can ship without one another, write a roadmap plus one plan per
  milestone. Keep the shared context in the roadmap, and in each milestone plan
  enough to execute it without reading its siblings. Link the roadmap to every
  milestone plan, each milestone back to the roadmap, and milestones to one
  another where one's check needs another's output.

## Write the handoff

Follow an existing repository convention. Otherwise write the plan under
`docs/plans/` with a descriptive filename, starting from
[assets/plan-template.md](assets/plan-template.md). Drop a section the work
leaves empty instead of filling it with the obvious.

Link the source that establishes the outcome — the issue, the shared
understanding, the predecessor plan — plus any source a step's execution or its
check depends on, and say in one clause what the executor takes from it. Do not
copy secrets, tokens, credentials, or personal data into the plan; name where
they live.

The plan is done when every step carries a runnable check and nothing in it
points back at this conversation: a sentence containing "as discussed", "as
agreed", or "see above" names evidence the executor does not have.

Report the plan path, the outcome, the approach, and each open risk with the
step or decision it affects. Hand the plan back and wait; begin implementation
only when the user authorizes it.
