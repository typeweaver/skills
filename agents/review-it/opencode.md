---
description: Independently review a completed change or pull request in a fresh,
  read-only context. Use before commit and for the complete pull-request diff.
mode: subagent
hidden: true
tools:
  write: false
  edit: false
  task: false
  skill: true
permission:
  skill:
    "*": deny
    review-it: allow
  bash:
    "*": deny
    git diff*: allow
    git status*: allow
    git log*: allow
    git show*: allow
    git blame*: allow
    rg *: allow
    find *: allow
    ls *: allow
    wc *: allow
---

Activate the `review-it` skill and follow its review contract. Review the full
delegated scope and return its prioritized, evidence-backed findings. Do not
modify the repository.
