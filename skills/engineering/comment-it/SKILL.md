---
name: comment-it
description: >-
  Write, revise, or review source-code comments that preserve context unavailable
  from the code. Use for module comments, inline explanations, API documentation,
  TODOs, deprecations, suppressions, or workaround notes during implementation or
  review. Do not use for standalone user documentation, general prose, commit
  messages, or review discussion.
---

# Comment It

Make comments preserve information a future reader cannot recover reliably
from the code. Write for the repository at HEAD without relying on the
conversation, diff, implementation history, or review discussion.

Respect the task's scope. Improving a name, type, structure, assertion, or test
is preferable when it can express the information and the task authorizes that
change. Otherwise, recommend the improvement or limit the work to comments.

## Identify the reader and publication path

Determine whether documentation comments serve source contributors, API
callers, or end users through generated documentation or editor tooling. Write
for that audience and follow the repository's language and generation
conventions. Do not apply contributor-facing style to public documentation.

## Decide whether a comment earns its place

Use a comment to preserve:

- rationale or a rejected obvious alternative;
- domain meaning, terminology, or algorithmic intent hidden by the mechanics;
- an invariant, unit, lifetime, ordering, security, performance, or concurrency
  constraint that the code cannot express;
- non-obvious coupling, dependency behavior, or platform limitations;
- a deliberate irregularity, compatibility workaround, or regression guard;
- caller-visible contract details that a signature cannot express clearly.

Do not add comments that:

- narrate the next line or restate a name, type, or control flow;
- describe the change, prior implementation, conversation, plan, or reviewer;
- make vague claims such as "handles edge cases" or "for safety";
- hide avoidable complexity or poor naming when an authorized code improvement
  can make the behavior clear;
- preserve disabled or obsolete code; version control already retains it;
- add export inventories, generic summaries, decorative sections, or
  documentation by quota.

## Put information at the right level

- **Module overview:** Explain a durable concept, architectural boundary,
  vocabulary, relationship, or design reason. Do not list exports or mechanics
  that will drift with routine edits.
- **Contract documentation:** Describe caller-visible behavior, surprising
  inputs or results, empty or indeterminate results, errors, side effects,
  invariants, and non-obvious usage. Exclude private implementation details.
  Add a minimal example only when names, types, and concise prose leave a
  relationship or usage unclear; state its purpose and expected result.
- **Inline explanation:** State the rationale, constraint, or relationship at
  the narrowest location where it matters. Do not translate syntax into prose.
- **TODO or workaround:** Name the concrete limitation, why the current choice
  is acceptable, and any removal or re-evaluation condition. For externally
  motivated workarounds, link a stable issue, upstream source, or specification
  that lets maintainers determine whether it still applies. Do not create an
  external record unless the task authorizes it.
- **Suppression:** Apply it at the narrowest practical scope. Name the suppressed
  rule or diagnostic, explain why it does not apply or why the exception is
  accepted, and state the removal condition when temporary.
- **Deprecation:** State the supported replacement and, when known, the removal
  horizon or condition. This is current contract information, not change-history
  narration.

## Write durable prose

- Use present tense, precise terms, and the shortest complete explanation.
- State the exact condition and consequence instead of asserting correctness.
- Keep each comment adjacent to the code whose maintenance depends on it.
- Follow surrounding syntax, tone, and useful documentation density unless it
  would preserve a defect; do not blanket a sparse module with prose.
- Back behavioral claims and invariants with types, assertions, or tests when
  practical and within scope; a comment does not enforce a contract.

Avoid words such as "now", "previously", "new", and "correctly" when they
refer to the current change. Keep history in version control and reviewer
discussion in the review system. Deprecation and removal notices are the
exception when they describe the current caller-visible contract.

## Maintain comments with the code

When behavior changes, update affected comments in the same change. Preserve
valid hard-won context, but delete comments that are false, stale, redundant,
or made unnecessary by clearer code.

Before finishing, read every affected comment as it appears at HEAD. It must
stand alone without the diff or conversation, agree with the surrounding code
and tests, preserve the provenance and re-evaluation condition of temporary
exceptions, and pass the deletion test: would removing it lose information the
code cannot express clearly?
