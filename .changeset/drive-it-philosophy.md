---
"equip-it": patch
---

Route `drive-it` through the Skill tool and replace its evaluative wording with
the severity, expert-lens, and blocked rules the skills it calls already define.
Split the interrupt duty from the blocked precondition so the rule is no longer
circular, and name an output for every phase the resume rule covers.
Add the optional Scaffold step: when a milestone adds or moves modules, public
functions, or dependencies, `scaffold-it` lays out the structure for one
approval before `craft-it` builds on it.
