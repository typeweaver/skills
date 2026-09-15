---
name: brief-me
description: Condense a discussion, plan, active implementation, or reviewed
  delivery into a decision-ready brief that starts from the reader's context.
  Use when the user asks where things stand, wants catching up after a pause,
  needs a progress check or a pull-request handoff, or says an explanation did
  not land. Not for writing a durable document, a pull request description, or
  a commit message.
---

# Brief Me

Brief a reader without your context: start where they are, then say where
things stand, in one read. Verify against the repository and durable
artifacts; prefer verified state over earlier narrative.

## Output

1. **Where we are** — one or two sentences of context: which problem, which
   part of the system, why it matters now. Use the repository's own names.
2. **Bottom line** — two or three sentences: where it stands and what that
   means.
3. **Three to five bullets** — the detail this situation needs: agreed and
   open points, commitments, achieved and next, how to see it working, and the
   weaknesses, risks, or shortcuts the reader should know. Include the one or
   two decisions that ruled out an alternative the reader would most likely
   have expected.
4. **Smallest view that makes it clear** — at most one: pseudocode, call tree,
   component tree, shallow file tree, Mermaid flow or sequence, or a
   diff-shaped sketch of what changes. Add it only when the bullets would
   otherwise have to describe a sequence or structure the reader must hold in
   mind. Place it next to the sentence it supports.

End with exactly one recommended choice when a user decision is needed.

## When it did not land

If the user says they are lost, do not summarize again. Re-pitch: context
first, simpler words, one view, and only the additional context needed to
explain the same conclusion.

## Language

- Reference by path what lives in a plan, issue, commit, or diff; do not
  repeat it. Keep credentials, tokens, private keys, `.env` contents, and
  internal hostnames the repository does not already publish out of the brief;
  name where they live.
- When a literal phrase exists, use it. Define a repository or domain term in a
  short clause the first time it appears.
- Filler is a sentence that evaluates the work — "solid", "clean",
  "successfully" — instead of stating what is true or what remains. Delete it
  or replace it with the fact.
- A brief after work has landed with no weakness, risk, or shortcut bullet has
  dropped an inconvenient fact. Add one or say that none is known.
- Distinguish fact from inference, done from planned.
- Stop after the view; do not restart analysis or implementation.
