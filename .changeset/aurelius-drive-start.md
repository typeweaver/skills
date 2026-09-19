---
"equip-it": patch
---

Add a semantic `preload` field to agent sources and inline each canonical
`SKILL.md` body into every generated adapter as startup context. `aurelius-drive`
now loads `aurelius` and the user-only `drive-it` from selection on Claude Code,
OpenCode, and Codex, and `drive-it` calls `aurelius` only when it is not already
loaded. Because agents route to other repository skills at runtime, `install`
now rejects `--skills none` when an agent is selected, and `update` and `doctor`
flag a legacy agent-only receipt. Generation fails on unknown, duplicate,
link-bearing, or autolinked preload skills, and Codex `developer_instructions`
is serialized as a valid TOML basic string.
