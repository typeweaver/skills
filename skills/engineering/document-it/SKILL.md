---
name: document-it
description: Write or rewrite a standalone document that answers the questions
  its reader arrives with. Use when asked to write the README, a guide, an ADR,
  or the docs for something, to document how X works, to explain something for
  new contributors, or when a document is too long and nobody reads it. Not for
  source-code comments, a progress summary or handoff, a pull request
  description, a commit message, or a plan.
---

# Document It

A document answers named reader questions, and a fresh reader proves it. A
section the reader did not ask a question about does not belong in this
document.

Read the target repository's style guide, documentation layout, and neighboring
documents first, and follow them; carry no conventions from elsewhere. This
skill writes files in the repository and publishes nothing; publishing a
document outside the repository needs its own authorization. No document
carries credentials, tokens, private keys, `.env` contents, and internal
hostnames the repository does not already publish, and none carries a customer
name: state the constraint without the value.

## 1. Name the reader and the type

Write down one line each: who reads this, the one question they arrive with,
and which type answers it. Use one type per document. When the material needs
two, write two documents and link them.

- **Tutorial** — first success, one path, no alternatives, no rationale.
- **How-to** — stated problem, prerequisites, steps, a result they can check.
- **Reference** — exact behavior, ordered for lookup, no teaching.
- **Explanation** — why it is this way, alternatives rejected, consequences.

Tells that the types are mixed: a rationale paragraph between numbered steps;
every option listed inside a walkthrough; a first-success path that branches on
"if you use X". Move that material to the document whose type owns it.

## 2. List the questions, answer first

List every question the reader asks, in the order it arises for them, not in
the order the system was built. Keep only the questions this reader asks before
they can act; move the rest to a second document or cut them. Each remaining
question becomes one section, and that section's first paragraph is the answer.
Detail, caveats, and background follow it. Where a rule exists, show the example
before the rule.

If you catch yourself writing a section before the question list exists, stop
and write the list.

Done when the list holds only questions that block the reader from acting,
every question on it has a section, and every section answers its question in
the first paragraph, with no preamble before the answer.

## 3. Write plainly

- Mark a requirement as one ("must", "do not") and a recommendation as one
  ("prefer", "consider"). Do not leave the reader to guess which a sentence is.
- Define a term the first time it appears, once, then use it exactly.
- Mannered prose: a metaphor a reader could take literally and be wrong; an
  opening sentence that announces what the section will do; a word chosen for
  rhythm that a plainer word would replace without loss. Replace each with the
  literal statement.

## 4. Delete

Cut the introduction that announces the document, the conclusion that repeats
it, the back-reference ("as we saw above"), the second example that teaches
what the first taught, and anything the reader reads off the code or the tool's
own output.

Done when nothing is left that served a question the step 2 cut removed, and
removing any remaining paragraph would leave a question that survived the cut
unanswered.

## 5. Run the reader test

Give the document alone — no repository, no conversation — to a fresh reader
and ask it the step 2 questions. With subagents: spawn one in a clean context
whose only input is the document text. Without subagents: start a new session,
or run a separate agent invocation, with the document pasted as its only
context. Do not answer from your own memory of writing it; you cannot unsee the
material. When neither is available, say so, list the questions you could not
test, and hand the document back for a reader check.

A wrong or hedged answer is a gap in the document, not in the reader. Fix the
section that should have answered it and run the test again, at most twice.
When an answer is still wrong after the third run, report the question and the
gap instead of rewriting again.

Done when a fresh reader answers every listed question correctly from the
document alone, or when the report names the questions that stayed unanswered
and why.

Report the reader, the type, the question list, and each reader-test answer
that forced a fix.
