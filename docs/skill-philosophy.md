# Skill philosophy

A skill gives an agent a useful way to approach a recurring task. It should
change the agent's decisions or actions while leaving room for judgment.

## Give each skill a clear job

State the task and desired outcome first. Keep everything in the skill relevant
to that job. When another task needs its own trigger and outcome, give it its
own skill. An orchestrator may guide a longer workflow by calling focused
skills; each focused skill should also work on its own.

Describe when the skill applies in words the user would use. Distinguish it
from neighboring skills where confusion is likely. Use model invocation when
the agent should discover the skill from context. Reserve user-only invocation
for workflows that should start exclusively through an explicit request, and
encode that choice for every supported harness.

## Trust the agent's judgment

Give the agent a goal, the considerations that change its decisions, and the
constraints it must respect. Avoid generic advice, exhaustive edge cases, and
instructions it would follow anyway. Use a fixed sequence or format when the
task depends on one. Otherwise let the agent choose how to reach the outcome.

Make decision rules concrete enough to use. When several approaches could
work, ask the agent to weigh their value, effort, and risks and recommend one.
When a step is easy to end too early, say what must be true before moving on.
Keep verification proportional to the change and focus on the outcome the
skill is meant to produce.

## Write for action

Use plain, direct English. Prefer short sentences and familiar words. Speak to
the agent in the imperative, and lead with what matters most. Keep explanations
that help the agent decide in cases the rule does not name. Cut repetition,
filler, and commentary about the writing itself.

Use a term consistently once it has a defined meaning. Follow the repository's
`GLOSSARY.md`. Prefer a positive instruction that names the desired behavior;
state a prohibition when it is needed to protect a real boundary.

Keep the main `SKILL.md` as short as the task allows. Put guidance every run
needs there, beside the action it supports. Move substantial details used only
in certain cases to a linked reference. Add scripts or assets only when they
make the work more reliable or easier to repeat.

## Preserve ownership and boundaries

The agent should research facts it can find and make reversible decisions
within the agreed scope. Bring the user choices that change the outcome, scope,
or a decision that is difficult to reverse, with a recommendation they can
accept or correct.

Authorization is specific to the action. A skill must not treat approval to
implement as approval to push, publish, deploy, create external records, or
merge. Harness adapters must preserve the same boundary. Learn the target
repository's conventions at execution time; keep organization-specific policy
out of reusable skills.

## Revise with evidence

Read the existing skill and the behavior it protects before changing it.
Simplify wording and structure without silently dropping a useful decision,
constraint, or safety boundary. Check that the description triggers the right
tasks and that the instructions lead to the intended result. For a substantial
or uncertain revision, try representative tasks and inspect what the agent
actually does. Use observed failures to sharpen the skill instead of adding
rules for hypothetical ones.
