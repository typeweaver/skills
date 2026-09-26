---
name: plan-it
description:
  Write a plan another agent can execute, with decisions and a runnable check for every step.
  Use when a settled approach spans several steps or independently shippable milestones.
  Not for shaping an unclear idea, sprint planning, or a one-step change.
---

# Plan It

Your task is to write a plan another agent can execute without this conversation.

Start from the shared understanding, repository instructions, related plans, and the checks the repository runs.
Find facts yourself before asking the user.
Ask only when a missing decision changes the scope, the steps, or a choice that is expensive to reverse.
Offer a recommendation the user can accept or correct.

## Decisions

Record each decision where two workable approaches existed: what you chose, why the alternative lost, and what the choice requires in implementation.
If the choice rests on an unverified assumption, name the observation that would reverse it.

Keep the decision, not the conversation that led to it.

## Steps

Give each step a change to the system and an observable outcome.
End it with `Done when:` and a check the executor can run: a command, a file that exists, or a test that passes.
"Reviewed", "looks right", and "works as expected" are not checks.

The repository's checks pass after each step.
Combine steps that would leave them broken.
Order steps by real dependencies, including what a later check reads, without inventing a sequence for independent work.

If research must settle a remaining choice, make the research its own step.
Name the decision it unlocks and the observation that settles it.

For work across several layers, build one narrow working path through them before expanding it.
Use expand-contract when a mechanical change is too wide to slice by case.

When outcomes can ship independently, write a roadmap and one plan per milestone.
Keep shared context in the roadmap and enough context in each milestone plan to execute it without reading its siblings.
Link the related plans.

End with checks for intended behavior, likely regressions, and documents or operational settings the implementation affects.

## Handoff

Follow the repository's plan convention.
Otherwise write under `docs/plans/` using [the plan template](assets/plan-template.md), and omit sections the work does not need.

Leave workflow actions such as creating a branch, committing, and opening a pull request out of the implementation steps.
Point to sensitive information instead of copying secrets, personal data, or unpublished internal hostnames into the plan.

Check that every step has a runnable completion check and every reference the executor needs is available outside this conversation.
Report the plan path, outcome, approach, and each open risk with the step or decision it affects.

Hand the plan back and wait; begin implementation only when the user authorizes it.
The `drive-it` skill requires that approval after the plan briefing.
