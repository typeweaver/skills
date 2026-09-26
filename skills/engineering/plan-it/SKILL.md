---
name: plan-it
description: Turn a settled approach into a plan another agent can execute.
  Use when implementation spans several steps or independently shippable
  milestones. Not for shaping an unsettled idea or scheduling capacity.
---

# Plan It

Write a plan another agent can execute without this conversation.

Start from the shared understanding, repository instructions, related plans,
and the checks the repository runs. Resolve facts you can find yourself.
Ask the user only when a missing decision changes the scope, the steps, or a
choice that is hard to reverse. Offer a recommendation they can accept or correct.

## Decisions

Record choices that shape the implementation: the approach chosen, the viable
alternative it beat, why, and what the choice requires. If a choice rests on an
unverified assumption, state what observation would change it.

Keep the decision, not the conversation that led to it.

## Steps

Make each step a change to the system with a clear outcome and a `Done when:`
check the executor can run. Repository checks must pass after every step.
Combine steps that would leave those checks broken.

Order steps by real dependencies. A step must have everything it needs when it
starts, including what its check reads. Do not invent a sequence for independent
work.

If research must settle a remaining choice, make that research a step. Name
the decision it unlocks and the observation that settles it.

For work across several layers, prefer a narrow working path through all of
them before expanding it. Use expand-contract when a mechanical change cannot
be sliced this way.

If outcomes can ship independently, write a roadmap and one plan per milestone.
Keep shared context in the roadmap and enough context in each milestone plan
to execute it on its own. Link the related plans.

End with checks for the intended behavior, likely regressions, and documents
or operational settings the change affects.

## Handoff

Follow the repository's plan convention. Otherwise write under `docs/plans/`
using [the plan template](assets/plan-template.md). Omit sections the work
does not need. Point to sensitive information rather than copying secrets,
personal data, or unpublished internal hostnames into the plan.

Check that every step has a runnable completion check and every reference the
executor needs is available outside this conversation.

Present the plan path, outcome, approach, and each open risk with the step or
decision it affects. Begin implementation only under the user's authorization,
including authorization already given.
