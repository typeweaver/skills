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

Keep a comment only when deleting it loses information the code cannot express.
Your reader has the code and the tests, not the conversation, the diff, or the
review. No comment carries a secret, credential, internal URL, customer name, or
pasted ticket content; state the constraint without the value.

## Identify the reader

Decide whether the comment reaches source contributors or API callers through
generated documentation and editor tooling, and follow the repository's
conventions for that surface. Contributor-facing style does not go on a
published one.

## Choose code or comment

When a rename, type, assertion, or test can carry the information and the task
authorizes changing code, make that change instead of writing the comment.
Otherwise write the comment and list the code improvement in your report as
"comment at `<file:line>` stands in for `<the change>`".

## Apply the deletion test

Deleting the comment loses information the code cannot express when it states:

- a rationale or a rejected alternative;
- a unit, ordering, lifetime, concurrency, security, or performance constraint,
  or a domain meaning, that the types cannot state;
- a compatibility workaround, deliberate irregularity, or regression guard;
- a caller-visible contract the signature hides.

Tells that it loses nothing: it restates the next line, a name, or the control
flow; it names the change, a reviewer, a plan, or the conversation; it claims
"handles edge cases" or "for safety"; it keeps disabled code; it inventories
exports or fills a documentation quota. Delete it. When the claim guards a real
constraint, state the exact condition and consequence instead of deleting it. A
comment that contradicts the code or the tests is false: correct or delete it.
One you cannot follow is not thereby wrong; check it against the code first.

## Put it at the right level

- **Module overview:** a durable concept, boundary, vocabulary, or design
  reason. Not exports or mechanics that drift with routine edits.
- **Contract documentation:** caller-visible behavior, surprising inputs or
  results, empty or indeterminate results, errors, side effects, and invariants,
  never private implementation detail. Add an example only when names and prose
  leave a usage unclear; state its expected result.
- **Inline explanation:** the constraint at the narrowest place it applies.
- **TODO or workaround:** the concrete limitation, what makes shipping it safe
  now, the condition for removal, and a link to a stable issue, upstream source,
  or specification when the cause is external. Do not create an external record
  unless the task authorizes it.
- **Suppression:** on the line or symbol that triggers the diagnostic, never on
  the file. Name the rule, why it does not apply, and when it comes out.
- **Deprecation:** the supported replacement and the removal horizon or
  condition when known.

## Do not narrate the change

Tell: "now", "previously", "new", "already", "correctly", or "as requested"
referring to the current change. Delete the word, or the whole comment when the
word was its subject. Deprecation and removal notices state the current
contract and are the exception.

## Finish

Read every comment you wrote or kept as it appears at HEAD, with the diff and
this conversation out of view. Done when each one passes the deletion test and
agrees with the surrounding code and tests.
