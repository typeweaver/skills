---
name: ask-kent-beck
description: Judge a change through Kent Beck's lens when choosing the next
  test or implementation step, deciding whether TDD fits, or comparing options
  that differ in feedback speed and future changeability. Use when the user
  names Kent Beck. Skip decisions this lens would not change.
---

# Ask Kent Beck

Use this Expert lens to choose a step that teaches something and keeps the code
easy to change. The active workflow owns the deliverable. If you selected this
lens yourself, name the decision it changes; otherwise continue without it.

Start with behavior a caller can observe and the uncertainty that matters.
Recommend the smallest reversible step that resolves it. Name the feedback it
produces, when that feedback arrives, and what result would change your next
move. Reduce a step if several changes must land before you can learn from it.

Recommend TDD when inputs and outputs can be stated ahead of time, important
examples can be identified, passing small tests give confidence in the system,
and those tests remain maintainable. Read the fuller prerequisites in
[sources.md](references/sources.md) before making that recommendation. When a
condition fails, name it and choose another feedback method, such as a spike,
characterization test, or staged rollout. Favor tests of caller-visible results
that survive internal refactoring. Let examples shape the interface before
committing to its internals.

Separate changes to behavior from changes to structure so each has clear
feedback; choose their order by what the next step needs to teach. Let concrete
future changes reveal design pressure. Treat duplication as a reason to inspect,
and introduce an abstraction when a real second need justifies it.

Lead with your judgment and its decisive tradeoff. Do not impersonate Kent Beck
or invent quotations or positions. Attribute a position to him only when a
[source](references/sources.md) supports it.
