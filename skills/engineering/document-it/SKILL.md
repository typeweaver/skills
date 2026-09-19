---
name: document-it
description: Write or rewrite a standalone document that answers the questions
  its reader arrives with, place it where developers and agents will look, and
  keep the docs map current. Use when asked to write the README, a guide, an ADR,
  architecture notes, or the docs for something, to document how X works, to
  explain something for new contributors, or when a document is too long, hard
  to find, or duplicated. Not for source-code comments, a progress summary or
  handoff, a pull request description, a commit message, or a plan.
---

# Document It

A document answers named reader questions, lives at the path that reader
opens, and a fresh reader proves it. A section the reader did not ask a
question about does not belong in this document. Keep each fact authoritative
in one home. Elsewhere, link to that home and include only the context this
reader needs to understand or act; do not copy volatile detail. Write one
document for developers and agents; a parallel agent-only copy is a second
home.

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
- **Explanation** — why it is this way: the mental model and the forces that
  produced it. Not a record of one named choice.
- **Decision** — one architecturally significant choice that affects structure,
  interfaces, dependencies, construction techniques, or non-functional
  characteristics; the alternative it beat and the consequences. Preserve the
  accepted choice and rationale; a reversal is a new document that supersedes
  it.

Tells that the types are mixed: a rationale paragraph between numbered steps;
every option listed inside a walkthrough; a first-success path that branches on
"if you use X"; a Decision that teaches a concept; an Explanation whose only
question is which option we picked. Move that material to the document whose
type owns it.

## 2. Place it

Do not restructure the repository's documentation layout. Evidence of a layout
is a docs index or configuration, a linked documentation tree, or neighboring
documents. Place the document by this precedence: an explicit repository path
or convention; a neighboring file of the same type; the existing docs root and
its naming convention. If a docs root exists but has no same-type neighbor,
name the file for its question there. Only when no layout exists, use the home
[references/layout.md](references/layout.md) names for the question.

A Decision follows the repository's existing ADR path, name, template, and
lifecycle. When no ADR convention exists, put it in `decisions/` under the
detected docs root; only when no documentation layout exists, use
`docs/decisions/`. In those fallback cases, number it monotonically and write
it from [assets/adr-template.md](assets/adr-template.md). Preserve an accepted
Decision's choice and historical rationale. Correcting spelling, broken links,
or factual transcription without changing meaning is allowed. A reversal gets
a replacement Decision and changes the old status to `superseded by ADR-NNNN`
or the repository's equivalent.
The repository README is a landing: what the project is, how to get a first
success, and a link to the map — not the home of architecture, reference, or
Decisions.

If you catch yourself writing the body before the path is chosen, creating a
directory no document will live in, moving existing documents to match the
default tree, or copying a paragraph that already lives in another document,
stop.

Done when the path matches the layout that applies and no other document
already answers the question.

## 3. List the questions, answer first

List every question the reader asks, in the order it arises for them, not in
the order the system was built. Keep only the questions this reader asks before
they can act; move the rest to a second document or cut them. Each remaining
question becomes one section, and that section's first paragraph is the answer.
Detail, caveats, and background follow it. Where a rule exists, show the example
before the rule.

Without a repository ADR template, a Decision's questions map onto Status,
Context, Decision, and Consequences in that order; cut any other section. When
a repository template exists, keep its required metadata and sections. Do not
move the choice into Context to satisfy answer-first.

If you catch yourself writing a section before the question list exists, stop
and write the list.

Done when the list holds only questions that block the reader from acting,
every question on it has a section, and every section answers its question in
the first paragraph, with no preamble before the answer.

## 4. Write plainly

- Mark a requirement as one ("must", "do not") and a recommendation as one
  ("prefer", "consider"). Do not leave the reader to guess which a sentence is.
- Define a term the first time it appears, once, then use it exactly.
- Mannered prose: a metaphor a reader could take literally and be wrong; an
  opening sentence that announces what the section will do; a word chosen for
  rhythm that a plainer word would replace without loss. Replace each with the
  literal statement.

## 5. Keep the map

The map is the repository's existing discovery mechanism: a docs index,
navigation file, sidebar configuration, or equivalent. When its scope includes
this document, add the entry in its native format and naming convention,
regardless of the document's path. When no mechanism exists, create
`docs/README.md` only for a document under `docs/` and add one line with a link
and the question it answers. Do not create `docs/` only to hold an empty index,
and do not invent a second map.

Do not copy the document into `AGENTS.md`. Keep an existing pointer accurate.
Add a pointer there only when the document is a constraint an agent must load
every session.

Done when the relevant discovery mechanism contains this document in its native
format, or the no-mechanism fallback map contains its link and question, and
`AGENTS.md` did not gain a copy of the document. Skip creating a map for a
document outside `docs/` when no discovery mechanism exists.

## 6. Delete

Cut the introduction that announces the document, the conclusion that repeats
it, the back-reference ("as we saw above"), the second example that teaches
what the first taught, the paragraph that restates another document, and
anything the reader reads off the code or the tool's own output.

Done when nothing is left that served a question the step 3 cut removed, and
removing any remaining paragraph would leave a question that survived the cut
unanswered.

## 7. Run the reader test

Give the document alone — no repository, no conversation — to a fresh reader
and ask it the step 3 questions. A blocking question must be answerable from the
document; a link may own deeper or volatile detail. With subagents: spawn one
in a clean context whose only input is the document text. Without subagents:
start a new session, or run a separate agent invocation, with the document
pasted as its only context. Do not answer from your own memory of writing it;
you cannot unsee the material. When neither is available, say so, list the
questions you could not test, and hand the document back for a reader check.

A wrong or hedged answer is a gap in the document, not in the reader. Fix the
section that should have answered it and run the test again, at most twice.
When an answer is still wrong after the third run, report the question and the
gap instead of rewriting again.

Done when a fresh reader answers every listed question correctly from the
document alone, or when the report names the questions that stayed unanswered
and why.

Report the reader, the type, the path, the question list, and each reader-test
answer that forced a fix.
