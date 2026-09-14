---
"equip-it": patch
---

Revise `pr-review-loop`: define blocked once in the shared wording, give the
Agree/Unsure/Disagree branches and the merge-ready checklist their tests,
discover the branch-update convention instead of hard-coding merge, and add a
redaction gate for what the loop publishes. Reconcile the two stop conditions
so the harness handback is an explicit terminal state, say what one pass over a
red required check does, route the Agree path through `conventional-commit`,
and name the object the branch update merges in.
