# Agents

Thin agent adapters provide execution context around the reusable skills. They
must not duplicate skill procedures.

## aurelius-drive

An explicitly selected primary agent for end-to-end delivery. It adopts
`aurelius` and starts the user-only `drive-it` workflow.

- [Claude Code adapter](aurelius-drive/claude.md)
- [Codex profile](aurelius-drive/codex-profile.toml)
- [OpenCode adapter](aurelius-drive/opencode.md)

Start it as the main session:

```bash
claude --agent aurelius-drive
codex --profile aurelius-drive
opencode --agent aurelius-drive
```

Selecting the primary agent or profile is the explicit human invocation of the
user-only `drive-it` workflow. The first normal prompt can therefore describe
the idea directly.

## review-it

A fresh, read-only subagent that loads the `review-it` skill and returns its
findings to the orchestrating agent.

- [Codex adapter](review-it/codex.toml)
- [Claude Code adapter](review-it/claude.md)
- [OpenCode adapter](review-it/opencode.md)

## Install

Agent adapters are installed from a checkout of this repository — for daily
use and for local development alike:

```bash
git clone https://github.com/typeweaver/skills.git
cd skills
./scripts/link-agents.sh --dry-run
./scripts/link-agents.sh
```

The linker preserves existing entries unless replacement is explicitly
requested. Claude Code and OpenCode use live symlinks that follow the checkout.
Codex profiles and custom agents are managed copies; rerun the linker after
changing one or pulling updates. Restart an active harness session after
adding or changing agents.
