---
"equip-it": patch
---

Revise `conventional-commit`: give the split and breaking-change rules their tests, turn the secrets prohibition into a pre-stage check that withholds the file, bound the scope lookup to the last 20 log subjects, read the commit back after making it, and loop the process until every change is committed or reported as withheld.
