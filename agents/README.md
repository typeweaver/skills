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
user-only `drive-it` workflow. Do not type `/drive-it` again. The first normal
prompt can describe the idea.

| Harness     | Start                             | How the skills load                                   |
| ----------- | --------------------------------- | ----------------------------------------------------- |
| Claude Code | `claude --agent aurelius-drive`   | Canonical content inlined in the agent body           |
| Codex       | `codex --profile aurelius-drive`  | Canonical content inlined in `developer_instructions` |
| OpenCode    | `opencode --agent aurelius-drive` | Canonical content inlined in the primary-agent body   |

### Preloaded skills

`agents/<name>/agent.yaml` declares `preload`, a top-level list of repository
skill names the agent must have at session start. Use it for any skill the
agent needs as startup context, including a model-invokable session stance such
as `aurelius`. An ordinary on-demand skill that the agent can discover and
activate from task context stays on the Skill tool. The generator resolves each
name from its canonical `skills/<bucket>/<name>/SKILL.md` and inlines the body
into every adapter as startup context:

- The YAML frontmatter is removed and `BEGIN`/`END preloaded skill` markers wrap
  the body.
- An unknown or repeated name or a `preload` that is not a list fails
  generation.
- A preloaded skill must be link-free, because a link cannot resolve from
  inside an adapter. Generation rejects link-like syntax anywhere in the body,
  including fenced and inline code examples: an inline link or image marker
  `](`, a Markdown reference-definition line, an HTML `href` or `src`
  attribute, and a `<scheme:...>` or `<user@example.com>` autolink. Absolute
  links are rejected too; preloaded workflow instructions need none.

The inline preload is only the startup context. An agent routes to other
repository skills at runtime, so the repository skills must be installed too.
`equip-it install` rejects `--skills none` when an agent is selected, and
`./scripts/link-skills.sh` must run before `./scripts/link-agents.sh`; the
agent linker installs adapters only and never the skills they route to.

The shared instructions state that the preloaded skills are already loaded and
must not be activated again.

## review-it

A fresh, read-only subagent that loads the `review-it` skill, may invoke
`ask-*` perspectives, and returns its findings to the orchestrating agent.
It does not edit the tree. OpenCode denies shell execution because its approval
mode can auto-approve commands that write; unavailable checks are reported as
not verified. Claude is limited to read and search tools because parent modes
can override subagent approvals. Codex runs checks in its read-only sandbox.

- [Codex adapter](review-it/codex.toml)
- [Claude Code adapter](review-it/claude.md)
- [OpenCode adapter](review-it/opencode.md)

## Install

Agent adapters are installed from a checkout of this repository — for daily
use and for local development alike. Install the skills first, because agents
route to them at runtime and the agent linker installs adapters only:

```bash
git clone https://github.com/typeweaver/skills.git
cd skills
./scripts/link-skills.sh --dry-run
./scripts/link-skills.sh
./scripts/link-agents.sh --dry-run
./scripts/link-agents.sh
```

The linker preserves existing entries unless replacement is explicitly
requested. Claude Code and OpenCode use live symlinks that follow the checkout.
Codex profiles and custom agents are managed copies; rerun the linker after
changing one or pulling updates. Restart an active harness session after
adding or changing agents.
