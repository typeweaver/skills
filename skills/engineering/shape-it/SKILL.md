---
name: shape-it
description: Move code to where its responsibilities live. Use when a folder or
  file mixes concerns, grows past one concept, imports sideways between peers
  or forms a cycle, when a `utils` or `helpers` folder collects unrelated code,
  when new code has no folder that owns it, and when asked to split,
  reorganize, or clean up the structure of a module or folder. Not for
  behavior changes.
---

# Shape It

Structure is a claim about ownership. When a file or folder stops telling the
truth about what belongs together, move the code before adding more.

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

## Restructure

1. Inventory what moves, who imports it, and which tests cover it.
2. Name the target by concept, in the repository's naming style. Keep tests,
   styles, and fixtures where the repository already keeps them; colocate only
   where it already colocates.
3. Move with `git mv`, or cut and paste for an extraction, fix imports, and
   update every place that names the path: entry points, boundary allowlists,
   ownership or architecture tables, tool aliases. Keep public contracts
   unchanged. Done when a search for the old path finds only changelog or
   history entries.
4. Run the checks the repository already has; add a dependency rule only when
   the repository already enforces boundaries.
5. Keep the move as its own commit, before or after the behavior change, never
   mixed with it. Create the commit only when the user has asked for commits;
   otherwise stage only the move and do not change what else is staged. In
   the commit message or the handback, say what moved and which trigger
   justified it.

Stay inside the trigger. A file in the diff that neither gave up nor received
moved code, nor names a moved or deleted path, is scope creep: revert it and
report what prompted it as a follow-up. A move may rename the moved file to its
concept; do not rename files that stay.
