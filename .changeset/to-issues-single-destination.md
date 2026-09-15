---
"equip-it": patch
---

`to-issues` records each outcome in exactly one place: the authorized tracker,
or local files when no tracker is authorized, never both. An outcome an existing
record already covers is not a second record. It also records an item only when
the current change is correct without it, splits records by the outcome that
could be closed on its own, writes a local mirror only where the repository
documents one, and keeps secrets out of a record. Publishing to a tracker needs
explicit authorization for that action, and the report says when nothing was
published. The description, the catalog one-liners, and the packaged prompt now
name that single destination.
