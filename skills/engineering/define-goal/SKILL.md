---
name: define-goal
description: Turn a settled task, ticket, plan, or request into one goal an agent or subagent can complete on its own. Use when handing off work, setting an autonomous objective, or deciding what done means. Not for shaping an unsettled outcome or planning the steps.
---

# Define Goal

Give an agent one goal it can pursue without you and a clear point at which to hand back.

State what must be true when the work is done and what result another person can inspect or reproduce to prove it.
Keep the scope and constraints named by the source: the task, ticket, plan, or request.

Name the outcome, not the activity.
"Refactor the parser" and "investigate the timeout" name work, not what should be true afterward.
"It works" is not evidence another person can check.

Keep the goal independent of tools.
Name a command or check only when the source or repository already documents it.
Leave out thresholds, metrics, and constraints you cannot trace to either.

If two plausible readings change the outcome or its evidence, ask one question that names both and recommends one.
Otherwise take the reading the context best supports and state it in the goal.

Write at most three sentences for the goal and one for the stop condition, with nothing else.
Say when to hand back: when the goal is proved, or when a required check, decision, or authorization remains unavailable after the agent has requested it or reported the block.

If you catch yourself listing steps or files, return to the outcome.
