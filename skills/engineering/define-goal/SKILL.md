---
name: define-goal
description: Turn a task, ticket, or plan into one goal an agent can work
  against on its own: the outcome, the evidence that proves it done, and when
  to stop. Use when handing work to an agent or subagent, setting the objective
  for an autonomous run, or asked what done means here. Use after the outcome
  is understood, not to explore or challenge it, and not to plan the work.
---

# Define Goal

State the agreed outcome as one goal an agent can work against without you and
know when to stop.

The goal states:

- what must be true when the work is done,
- what evidence proves it,
- the scope boundaries and constraints the source names,
- that the agent stops and reports when blocked: a required check, decision, or
  authorization cannot be obtained by the agent and the request has been posted
  or reported.

Name the outcome, not the activity: "refactor the parser", "improve error
handling", and "investigate the timeout" name work, not what is true once that
work is done.

Evidence is a result a third party can check, not "it works". Keep the goal
tool-independent: name a command or check only when the source or the
repository already documents it.

A threshold, metric, command, or constraint you cannot point to in the source
or the repository is invented: leave it out.

Ask one clarification question only when two plausible readings of the request
lead to different outcomes or different completion evidence. Ask it as the two
readings with the one you recommend. Otherwise take the reading the context
supports best and name it in the goal.

Output one goal, 1–3 sentences, and nothing else. If you catch yourself listing
steps, files, or commands, you are planning: state the outcome instead.
