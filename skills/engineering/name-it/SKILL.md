---
name: name-it
description: Sharpen a project's domain language and persist it in GLOSSARY.md.
  Use when asked to name domain terms, build or edit a glossary, or when two
  names are in play for one thing (or one name for two) and that choice should
  be written to GLOSSARY.md. Not for stress-testing an idea (`challenge-me`),
  running the delivery workflow (`drive-it`), ADRs or reader docs
  (`document-it`), renaming symbols in code (`craft-it`), or looking up
  vocabulary already in the glossary.
---

# Name It

Give each domain concept one canonical name and write it to `GLOSSARY.md`
the moment it is settled. A term is settled when the user accepts the
canonical name and the boundary you proposed, or accepts your
recommendation. Write it in that turn. Reading the glossary for vocabulary
is not this skill.

## Find the file

The glossary is `GLOSSARY.md` at the repository root, not `CONTEXT.md`.
Create it when the first term is settled or the first asked collision is
left open, not before. If the file exists, read it before the first
question.

## Challenge the language

When the user uses a term that conflicts with the glossary, stop and quote
both. Ask which is right before continuing.

When two words cover one thing, propose one canonical term and the rejected
synonyms. When one word covers two things, propose a distinct canonical term
for each meaning. Do not proceed while either collision remains in play.

When a relationship is claimed, invent one concrete scenario that would fall
on the wrong side of the boundary if the claim were loose. Ask which side it
falls on.

When the user states how something works, check the code. If they disagree,
quote the code and the sentence and ask which is right. Do not write the
term until that is settled.

Research names already in the code, schema, and docs yourself. Ask only
which of two candidate terms is canonical, or whether a proposed boundary
is right.

## Write the term

The moment a term is settled, write it. If you catch yourself collecting
terms to dump at the end, stop and write the ones that already settled.

Follow [GLOSSARY-FORMAT.md](GLOSSARY-FORMAT.md). A glossary entry defines
what the thing **is**, in one or two sentences. List `_Avoid_` only for
synonyms that were actually in play. Write any settled domain relationship
the term participates in under Relationships, and any collision that was
asked and left open under Flagged ambiguities. It is not a spec, a scratch
pad, an ADR, or a procedure.

Before adding a term, check whether it belongs to this project's problem
domain. A general programming concept stays out even when the project uses
it heavily; a domain term need not be unique to this project.

If you catch yourself writing how it is implemented, why it was chosen, or
a type or file name into the glossary, stop. Delete that sentence.

If `AGENTS.md` or `CLAUDE.md` exists and has no pointer to `GLOSSARY.md`
yet, add one sentence to the instruction file the repository treats as
canonical, whether the glossary file is new or already there:
`GLOSSARY.md` is the canonical domain language; use those terms exactly and
do not invent synonyms. Do not create an instruction file just to hold the
pointer.

## Stop

Stop when every settled term from this session is in the file, every settled
relationship it participates in is under Relationships, and every collision
that was asked and left open is under Flagged ambiguities. Do not record a
collision under Flagged ambiguities until you have asked.

Report the path, the terms added, changed, or removed, collisions left
open, and whether a pointer was added.
