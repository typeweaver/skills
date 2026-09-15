---
"equip-it": patch
---

`to-issues` records each outcome in exactly one place: the authorized tracker,
or local files when no tracker is authorized, never both. It also records an
item only when the current change is correct without it, splits records by the
outcome that could be closed on its own, and keeps secrets out of a record.
