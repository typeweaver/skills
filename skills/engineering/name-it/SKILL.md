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
Create it when the first term is settled, not before. If the file exists,
read it before the first question.

## Challenge the language

When the user uses a term that conflicts with the glossary, stop and quote
both. Ask which is right before continuing.

When one word covers two things, or two words cover one thing, propose one
canonical term and the rejected synonyms. Do not proceed with both in play.

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
synonyms that were actually in play. Write any settled relationship the
term participates in, and any collision that was asked and left open under
Flagged ambiguities. It is not a spec, a scratch pad, an ADR, or a
procedure.

Before adding a term, check whether it is unique to this project's domain.
A general programming concept stays out even when the project uses it
heavily.

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
relationship it participates in is under Relationships, and every
code/language clash was either settled or asked and then recorded under
Flagged ambiguities.

Report the path, the terms added, changed, or removed, and whether a
pointer was added.
