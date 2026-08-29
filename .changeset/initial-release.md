---
"typeweaver-skills": minor
---

Initial release: guided installer for Typeweaver Skills. Detects Claude Code,
Codex, OpenCode, and Kiro, installs bundled skills and agents with
transactional conflict-safe semantics, and supports `install`, `update`,
`doctor`, `uninstall`, and `generate` — interactively for humans and
flag-driven for automation. Exact existing content is adopted; replacing or
removing conflicting selected components requires explicit `--force`.
