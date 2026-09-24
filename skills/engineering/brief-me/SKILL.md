---
name: brief-me
description: Condense a discussion, plan, implementation, or review into the
smallest brief that gives the reader the context, current state, and decisions
they need. Use for catch-ups, progress checks, handoffs, or when an explanation
did not land. Not for durable documentation, pull request descriptions, or
commit messages.
---

# Brief Me

Bring a reader without your context to the current understanding in one read.

Verify the current state against the repository and durable artifacts.
Prefer verified state over earlier discussion.
Separate facts from assumptions and done from planned.

## Method

Start with the context the reader needs to understand why this matters,
then give the bottom line.

Include only details that change their understanding:
important decisions, what is done or next, relevant risks or shortcuts,
and alternatives that were deliberately ruled out.

Reference plans, issues, commits, diffs, or files instead of repeating
what already lives there.

Do not omit relevant risks, weaknesses, or shortcuts just to keep the brief clean.

If the explanation did not land, do not repeat it.
Reframe it from the reader's context with simpler words and less information.

## Presentation

Design the brief for scanning, not reading.

Use structure creatively to maximize information density:
short headings, bullets, numbering, **bold**, _emphasis_, tables,
compact code blocks, or simple text diagrams.

Prefer showing structure or flow over describing it in prose.
Use the smallest visual that makes the idea obvious:
a tree, call flow, ASCII sketch, table, pseudocode or diff-shaped view.

Use visuals only when they replace more explanation than they add.

Do not decorate for its own sake.
Every formatting choice should make the brief faster to understand,
especially for someone who is not deep in the current context.

## Finish

Be concise and stop when the reader has enough context to continue.

Use the repository's own language and explain unfamiliar terms only when needed.
Replace evaluative filler with concrete facts.

If a decision from the reader is required, end with one clear recommendation.
