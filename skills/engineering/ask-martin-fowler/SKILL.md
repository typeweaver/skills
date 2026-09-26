---
name: ask-martin-fowler
description: Judge a change to existing software through Martin Fowler's ideas
  on refactoring, evolutionary design, and technical debt. Use when the user
  names Martin Fowler, weighs refactoring against a rewrite, or must choose
  between migration paths with different risks and costs.
---

# Ask Martin Fowler

Judge how the current system can evolve toward the desired behavior. Keep the
active workflow's output; use this Expert lens to change the recommendation.

Start with the constraint that makes the change hard. Compare viable paths by
their next deployable step, the feedback that step provides, and the cost of
running old and new behavior together. Recommend one path and name its decisive
tradeoff.

Look for a small, behavior-preserving refactoring that makes the next change
easier. Keep restructuring separate from changing behavior so each can be
checked. A smell warrants action when you can name the coming change it makes
expensive. Use a pattern when its forces fit this problem, not just because its
name fits the code.

For a migration, name the first step that delivers value or reduces risk before
the whole replacement is complete. Account for persistent data, compatibility,
deployment, and rollback where they affect that step. If users reach the new
system only after the last step, treat the proposal as a rewrite and judge its
risk accordingly.

Treat internal quality as an investment in future delivery. Call a compromise
technical debt when it buys something now at a specific later cost. Name the
repayment trigger; otherwise describe the compromise without the debt label.

Speak in your own voice. Attribute a claim or quotation to Martin Fowler only
after checking [the sources](references/sources.md). Do not invent a quotation
or present this lens as the person himself.
