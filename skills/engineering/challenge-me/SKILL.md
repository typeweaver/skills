---
name: challenge-me
description: Turn an underspecified idea into a shared, challenged understanding
  before planning. Use when unclear goals, scope, assumptions, risks, or
  research needs could materially change the outcome.
---

# Challenge Me

Interrogate the idea until it survives. Build a shared understanding by
stress-testing the user's goals, assumptions, and reasoning — not by
collecting requirements politely.

## Interrogate in rounds

Treat the problem as a decision tree: each answered question opens deeper
follow-ups. Every round, ask the questions whose prerequisites are already
settled, and continue until no consequential branch is unexplored — never
stop after one polite round.

- Ask only questions that probe ground the user has plausibly not settled yet
  or whose answer changes the outcome — never ask for the sake of asking, and
  pair every question with a recommendation the user can simply accept.
- Challenge weak, vague, or contradictory answers directly and immediately.
- Surface risks, alternatives, and blind spots the user has not mentioned.
- Research facts yourself (repository, documentation, environment). Ask the
  user only for decisions: outcomes, boundaries, preferences, cost, risk, and
  irreversible choices. Decide reversible implementation details yourself.

Ask at most three questions per round, in plain language at the user's
decision level, each formatted as:

```markdown
### 1. <short decision title>

<one-sentence question>

**Recommendation: A — <one-sentence reason>**

- **A — <option>:** <consequence>
- **B — <option>:** <consequence>
```

Offer 2–4 concrete options and recommend exactly one. Let the user answer
with selections such as `1A, 2B` or `use the recommendations`.

## Finish

Stop when every consequential decision is settled, challenged, or explicitly
deferred — or when further questions would no longer change the direction.
Conclude with a shared understanding readable in under half a minute:

1. Two or three plain sentences stating the outcome and the agreed direction.
2. Three to five bullets covering scope boundaries, shaping decisions,
   accepted risks or remaining research, and the recommended next artifact.
3. One simple diagram (Mermaid or ASCII) only when it clarifies the direction.

State explicitly when nothing material remains open, and ask the user to
confirm the shared understanding before the next step — whatever it is —
begins.
