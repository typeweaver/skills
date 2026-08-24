---
name: define-goal
description: Turn a task, ticket, plan, or request into a concise, verifiable
  goal. Use when an autonomous agent needs a clear outcome and stopping
  condition.
---

# Define Goal

Turn the provided context into a short, tool-independent objective.

A good goal states:

- what concrete outcome must be true,
- what evidence proves completion,
- important scope or constraints when they matter,
- when the agent should stop and report a genuine blocker instead of grinding.

Prefer measurable or binary outcomes over activity descriptions.

Ask one concise clarification question only when missing information could
materially change the intended outcome or how completion is verified.
Otherwise infer reasonable details from the available context.

Do not invent requirements, metrics, commands, or constraints.

When genuinely blocked by unavailable external input, permissions,
infrastructure, or a required human decision, stop and report the blocker
and what is needed to continue.

Output one concise goal. Prefer 1–3 sentences.
Do not add tool-specific syntax unless requested.
