---
name: shape-it
description: Move existing code to the module that owns it without changing
  behavior. Use when asked to split, reorganize, untangle, or clean up the
  structure of a module or folder, fix an import cycle, or sort out a `utils`
  or `helpers` folder. Not for behavior changes (`craft-it`) or for deciding
  where a boundary in a Next.js app should be (`nextjs-feature-architecture`).
---

# Shape It

Move code to the concept that owns it, in a move-only change kept apart from
behavior changes.

## Recognize the trigger

An entry point is the path importers outside a folder are meant to use: a
package manifest's exports, an index a boundary rule names, or a documented
API. Act on any of these triggers.

- A folder whose files change for different reasons or in different pull
  requests: split by reason for change.
- A file that exports more than one concept, or that you cannot name without
  "and": extract the second concept.
- A name by type (`utils`, `helpers`, `common`, `misc`, `types`) that collects
  unrelated code: move each piece to the concept that owns it.
- Sideways imports between peers (siblings under one parent), or a cycle: move
  the shared part to a module both can import without importing each other, or
  make one peer the owner and route the other's import through its entry point.
- A pass-through module or a barrel that exists only to re-export: delete it
  unless it is an entry point.
- New code that fits under no existing concept: create the concept that owns
  it; do not open a `misc` folder.

Skip a trigger that fires by the letter when every importer reaches the code
through its entry point and a reader searching for the concept would look at
the current path first. Read an existing boundary allowlist or dependency rule
as evidence: an allowed edge is a decision, leave it; an allowed edge that
closes a cycle is debt, report it; a mutual dependency already routed through
a neutral contract module is resolved, leave it.

When the question is where a boundary in a Next.js app should be, not where
existing code moves, call the Skill tool with `nextjs-feature-architecture`.

## Restructure

1. Name the target by concept, in the repository's naming style. Keep tests,
   styles, and fixtures where the repository already keeps them; colocate only
   where it already colocates.
2. Move with `git mv`, or cut and paste for an extraction, fix imports, and
   update every place that names the path: entry points, boundary allowlists,
   ownership or architecture tables, tool aliases. Keep public contracts
   unchanged. Done when a search for the old path finds only changelog or
   history entries.
3. Add a dependency rule only when the repository already enforces boundaries.
4. Keep the move as its own commit, before or after the behavior change, never
   mixed with it. Create the commit only when the user has asked for commits;
   otherwise stage only the move and do not change what else is staged. In
   the commit message or the handback, say what moved and which trigger
   justified it.

Stay inside the trigger. A file in the diff that neither gave up nor received
moved code, nor names a moved or deleted path, is scope creep: revert it and
report what prompted it as a follow-up. A move may rename the moved file to its
concept; do not rename files that stay.
