# Skill philosophy

Your task is to write skills that change what an agent does.
Keep the instructions short enough to use and complete enough to trust.

## Scope

Give each skill one job and open with that job or the role that owns it.
"Build the smallest complete change" and "You are Aurelius" put the agent to work before explaining the method.

Describe the outcome and the situations that call for the skill in words a user would use.
Distinguish neighboring skills where a task could trigger the wrong one.
Use model invocation when the agent should discover the skill from context,
and user-only invocation when only an explicit human request should start it.
Encode that choice for every supported harness.

An orchestrator can call focused skills by name, but each focused skill should also work on its own.
Refer to another skill as "the `shape-it` skill" when the relationship matters; do not copy its instructions.

## Judgment

Give the agent a goal, the decisions it must make, and the boundaries it must keep.
Trust it to choose reversible steps within the agreed scope.
Ask the user for choices that change the outcome, scope, or a decision that is difficult to reverse,
and offer a recommendation.

Pair a rule with its limit when judgment matters.
"Follow the repository's conventions by default, but do not follow them blindly"
gives a direction without turning it into a ritual.

Keep a concrete example when it makes a rule testable.
"A test that fails after renaming an internal while behavior holds" says more than "avoid brittle tests."
Give a step a clear finish when an agent could otherwise move on too early.

A **No-op** is a sentence the agent would follow if it were deleted.
Remove it, along with generic advice, repeated instructions, and edge cases that do not change a decision.
Be as concise as possible and as detailed as necessary.

## Form

Write in plain, direct English.
Put one sentence or meaningful part of a sentence on a line, then leave space between thoughts.
Keep paragraphs short and headings few.
This is a reading rhythm, not a line-length rule.
A line over 120 characters has skipped a break; the repository checks report it.

Speak to the agent as a role with work to do.
Give a skill a memorable line when that line carries its judgment,
as "Assume that the best code is no code" does for `craft-it`.
Do not invent a slogan to fill a slot.

Keep a fixed template when another step relies on that output or the user needs a predictable form.
The question format in `shape-it` earns its place; ordinary advice does not need a template.

State a hard boundary plainly: "Do not push" is clearer than a qualification that might permit it by accident.
Keep the positive action beside a prohibition when it helps the agent continue.
Use the terms in `GLOSSARY.md` exactly, without rotating synonyms.

Keep guidance every run needs in `SKILL.md`, beside the action it supports.
Move substantial details used only in some cases to a linked reference, and say when to read it.
Use scripts or assets when they make repeated work more reliable.

## Boundaries

Authorization belongs to an action.
Approval to implement does not authorize pushing, publishing, deploying, creating external records, or merging.
An adapter must preserve the same role and boundary across harnesses.

Research facts the agent can find instead of asking the user.
Learn the target repository's conventions when the skill runs; keep local policy out of a reusable skill.

An Expert lens may speak in its expert's voice.
It still needs evidence for quotations and claims about that person's documented views.
The active workflow keeps its own output and approval boundaries.

## Revision

Treat existing skill behavior as deliberate until a requested revision says otherwise.
Read the old skill and identify its triggers, output contracts, examples, and hard boundaries before simplifying it.
Shortening a sentence is useful only when the behavior survives.

Check the description against tasks that should invoke the skill and nearby tasks that should not.
For a substantial or uncertain change, try representative tasks and inspect what the agent actually does.
Keep verification proportional to the change, and use observed failures to sharpen the instructions.
