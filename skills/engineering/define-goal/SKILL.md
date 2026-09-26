---
name: define-goal
description: Give an agent or subagent one bounded goal with checkable evidence
  and a stopping point. Use when handing off a settled request, ticket, or plan,
  setting an autonomous objective, or deciding what done means. Not for shaping
  the goal or planning the steps.
---

# Define Goal

Turn the settled request into one goal an agent can pursue alone and know when
to hand back.

State what must be true when done, what result another person can inspect or
reproduce, and the source's scope and constraints. The source is the task,
ticket, plan, or request. Name the outcome, not the activity: "refactor the
parser" does not say what will be true.

Name a command or check only when the source or repository documents it. Leave
out thresholds, metrics, and constraints you cannot trace to either.

If two plausible readings change the outcome or its completion evidence, ask
one question that names both and recommends one. Otherwise choose the reading
the context best supports and state it in the goal.

Write at most three sentences for the goal and one for the stop condition;
nothing else. Include handing back when a required check, decision, or
authorization cannot be obtained by the agent after requesting it or reporting
the block.
If you catch yourself listing steps or files, return to the outcome.
