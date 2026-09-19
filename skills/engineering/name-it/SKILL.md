---
name: name-it
description: Sharpen a project's domain language and persist it in GLOSSARY.md.
  Use when a domain term is fuzzy, overloaded, or missing from the glossary,
  when asked to build or edit a glossary, or when code and conversation
  disagree on what a thing is called. Not for product decisions
  (`challenge-me`), ADRs or reader docs (`document-it`), or renaming
  symbols in code (`craft-it`).
---

# Name It

Give each domain concept one canonical name and write it to `GLOSSARY.md`
the moment it is settled. Reading the glossary for vocabulary is not this
skill.

## Find the file

The glossary is `GLOSSARY.md` at the repository root. Create it when the
first term is resolved, not before. If the file exists, read it before the
first question.

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
what the thing **is**, in one or two sentences, and lists rejected synonyms
under `_Avoid_`. It is not a spec, a scratch pad, an ADR, or a procedure.

Before adding a term, ask: is this unique to this project's domain, or a
general programming concept? Only the former belongs.

If you catch yourself writing how it is implemented, why it was chosen, or
a type or file name into the glossary, stop. Delete that sentence.

When you create `GLOSSARY.md` and the repository already has `AGENTS.md` or
`CLAUDE.md`, add one sentence to the instruction file the repository treats
as canonical, if it has no pointer yet: `GLOSSARY.md` is the canonical
domain language; use those terms exactly and do not invent synonyms. Do not
create an instruction file just to hold the pointer.

Do not write ADRs.

## Stop

Stop when every term that settled this session is in the file, every new
entry says what the thing is, rejected synonyms are listed, and code and
language agree or the disagreement is under Flagged ambiguities.

Report the path, the terms added, changed, or removed, and whether a
pointer was added.
