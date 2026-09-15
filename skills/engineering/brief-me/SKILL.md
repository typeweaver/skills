---
name: brief-me
description: Condense a discussion, plan, active implementation, or reviewed
  delivery into a decision-ready brief that starts from the reader's context.
  Use when the user needs orientation after a pause, a progress check, a
  pull-request handoff, or says that an explanation did not land.
---

# Brief Me

Brief for a reader who has been away: start where they are, then say where
things stand, in one read. Verify against the repository and durable
artifacts; prefer verified state over earlier narrative.

## Output

1. **Where we are** — one or two sentences of context: which problem, which
   part of the system, why it matters now. Use the repository's own names.
2. **Bottom line** — two or three sentences: what this is about, where it
   stands, what that means.
3. **Three to five bullets** — the detail this situation needs: agreed and
   open points, commitments, achieved and next, how to see it working, and the
   weaknesses, risks, or shortcuts the reader should know. Include material
   decisions made by the user or the agent.
4. **Smallest view that makes it clear** — at most one: pseudocode, call tree,
   component tree, shallow file tree, Mermaid flow or sequence, or a
   diff-shaped sketch of what changes. Place it next to the sentence it
   supports. Skip it when prose is enough.

End with exactly one recommended choice when a decision is needed.

## When it did not land

If the user says they are lost, do not summarize again. Re-pitch: context
first, simpler words, one view, and only the additional context needed to
explain the same conclusion.

## Language

- One idea per sentence, active voice, common words. Define a repository or
  domain term in a short clause the first time it appears.
- Never drop an inconvenient fact; distinguish fact from inference, done from
  planned.
- Stay under roughly 200 words plus the optional view, then stop; do not
  restart analysis or implementation.
