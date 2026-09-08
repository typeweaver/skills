---
name: shape-it
description: Restructure code whose placement no longer matches its
  responsibilities. Use when a folder or file mixes concerns, grows past one
  concept, imports sideways between peers, or a new piece has no natural home,
  and when asked to clean up, split, or reorganize a module. Not for
  behavior changes.
---

# Shape It

Structure is a claim about ownership. When a file or folder stops telling the
truth about what belongs together, move the code, in its own commit, before
adding more.

## Recognize the trigger

Act when you see one of these; name the trigger in the commit message.

- A folder whose files change for different reasons or in different pull
  requests: split by reason for change.
- A file that exports more than one concept, or that you cannot name without
  "and": extract the second concept.
- A name by type (`utils`, `helpers`, `common`, `misc`, `types`) that collects
  unrelated code: move each piece to the concept that owns it.
- Sideways imports between peers, or a cycle: move the shared part below both
  or give one peer explicit ownership.
- A module imported by two peers that do not share a lifecycle: it is a shared
  concept; place it where both can reach it without importing each other.
- A pass-through module or a barrel that exists only to re-export: delete it
  unless it is a deliberate public entry point.
- New code that has no natural home: that is a missing concept, not a reason
  for a new `misc` folder.

Read an existing boundary allowlist or dependency rule as evidence: every
allowed edge is a decision, and edges that service a cycle are debt.

## Restructure

1. Inventory what moves, who imports it, and which tests cover it.
2. Name the target by concept, in the repository's naming style. Colocate
   tests, styles, and fixtures with the code they exercise.
3. Move with `git mv`, fix imports, update entry points, and keep public
   contracts unchanged.
4. Run the checks the repository already has; add a dependency rule only when
   the repository already enforces boundaries.
5. Commit the move on its own, before or after the behavior change, never
   mixed with it. Say what moved and which trigger justified it.

Do not restructure beyond the trigger, and do not rename for taste.
