---
"equip-it": patch
---

Let the `review-it` agent invoke `ask-*` skills while preserving each harness's
read-only boundary. OpenCode denies unlisted tools and shell checks, Claude uses
read and search tools only, and handoffs include the patch when a reviewer
cannot resolve it safely.
