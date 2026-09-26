# Skill your Agents

Opinionated software-engineering skills and optional agent adapters for coding
agents. Install them with `equip-it`. Skills hold reusable behavior; agents add
startup context or tool boundaries for supported harnesses. See the
[skill philosophy](docs/skill-philosophy.md) for how skills are scoped and
tested.

## Where to start

| You need to...                                | Start with...                                            |
| --------------------------------------------- | -------------------------------------------------------- |
| Take an idea through delivery                 | [drive-it](skills/engineering/drive-it/SKILL.md)         |
| Work through an unsettled idea together       | [shape-it](skills/engineering/shape-it/SKILL.md)         |
| Get an independent engineering recommendation | [aurelius](skills/engineering/aurelius/SKILL.md)         |
| Catch up on a plan, change, or delivery       | [summarize-it](skills/engineering/summarize-it/SKILL.md) |
| Implement an agreed change                    | [craft-it](skills/engineering/craft-it/SKILL.md)         |
| Review a change for concrete failures         | [review-it](skills/engineering/review-it/SKILL.md)       |

Every skill works on its own. Only `drive-it` calls other skills to run the
full workflow. The [catalog below](#skill-catalog) covers the remaining skills.

## Install

Install the skills and native agent adapters with `equip-it`:

```bash
npx equip-it install
```

It supports Claude Code, Codex, OpenCode, and Kiro. See the
[CLI guide](cli/README.md) for flags, symlink and copy modes, updates, and
uninstall.

Install skills only with the Agent Skills CLI:

```bash
npx skills@latest add typeweaver/skills
```

Native agent adapters require `equip-it` or the repository linker below.

For local development, preview or create symlinks from this checkout into the
shared agent skills directory (`~/.agents/skills`, read by Codex and other
harnesses) and the Claude Code skills directory (`~/.claude/skills`):

```bash
./scripts/link-skills.sh --dry-run
./scripts/link-skills.sh
```

The linker preserves existing directories and unrelated symlinks. Run
`./scripts/link-skills.sh --help` for custom destinations and explicit symlink
replacement.

To switch this machine from CLI-installed copies to the live checkout, preview
and then replace only entries whose names belong to this repository:

```bash
./scripts/link-skills.sh --dry-run --replace-existing
./scripts/link-skills.sh --replace-existing
```

The normal command remains non-destructive. `--replace-existing` removes the
matching installed entries before linking them to this checkout. Running
`npx skills@latest add typeweaver/skills` again and confirming the overwrite
restores the published version. A later CLI update may do the same while local
links are active.

## Agents

Install the native agent adapters from a checkout of this repository (the same
path serves local development). Install the skills first: agents route to
repository skills at runtime, and `link-agents.sh` installs adapters only.

```bash
./scripts/link-skills.sh --dry-run
./scripts/link-skills.sh
./scripts/link-agents.sh --dry-run
./scripts/link-agents.sh
```

Claude Code and OpenCode receive live symlinks. Codex profiles and custom agents
are copied; rerun the linker after a Codex adapter changes.

- **[aurelius-drive](agents/aurelius-drive/codex-profile.toml)** — Explicit primary mode
  that takes an idea or agreed outcome to a production-ready pull request.
  It adopts Aurelius and starts the complete Drive It workflow. Every harness
  receives the canonical `aurelius` and `drive-it` content inline as startup
  context, then routes to the installed repository skills. Codex selects it with
  `codex --profile aurelius-drive`.
- **[review-it](agents/review-it/codex.toml)** — Fresh reviewer that inspects a
  change or pull-request diff, may run shell checks, and reports findings
  without edits. It activates a requested Expert lens when available.

Agent sources can define other roles later. When a source or preloaded skill
changes, run `pnpm generate` and keep the generated adapters with it. See the
[agent catalog](agents/README.md) for the source and adapter layout.

## Workflow

Invoke `drive-it` explicitly for the complete path. It guides the user through
these phases with the focused skills:

```text
shape idea → plan → scaffold if agreed → implement → review → commit → PR
```

The user confirms the shared understanding and approves the plan. Approval for
commit, push, external issues or review requests, deployment, and release is
action-specific. `summarize-it` makes the plan and delivery easy to inspect;
each focused skill also works independently.

## Skill catalog

### Core workflow

- [drive-it](skills/engineering/drive-it/SKILL.md) — Run the full workflow on
  explicit request.
- [aurelius](skills/engineering/aurelius/SKILL.md) — Give an independent senior
  engineering recommendation.
- [shape-it](skills/engineering/shape-it/SKILL.md) — Resolve an unsettled idea
  through critical dialogue.
- [summarize-it](skills/engineering/summarize-it/SKILL.md) — Bring a reader into
  context and show the current decision.
- [plan-it](skills/engineering/plan-it/SKILL.md) — Write executable steps for a
  settled approach.
- [define-goal](skills/engineering/define-goal/SKILL.md) — Give an agent one
  objective, completion evidence, and a stopping point.
- [scaffold-it](skills/engineering/scaffold-it/SKILL.md) — Check the proposed
  structure before implementing it.
- [craft-it](skills/engineering/craft-it/SKILL.md) — Implement an agreed code
  change.
- [review-it](skills/engineering/review-it/SKILL.md) — Find failures in a
  change and back them with evidence.
- [conventional-commit](skills/engineering/conventional-commit/SKILL.md) — Split
  and describe commits from the diff.
- [create-pull-request](skills/engineering/create-pull-request/SKILL.md) — Open
  or update a pull request for review.
- [pr-review-loop](skills/engineering/pr-review-loop/SKILL.md) — Address PR
  feedback and required checks until a human merges.
- [to-issues](skills/engineering/to-issues/SKILL.md) — Record authorized
  follow-up work.

### Expert lenses

Use one when its judgment changes the decision: [Barbara Liskov](skills/engineering/ask-barbara-liskov/SKILL.md),
[Donald Knuth](skills/engineering/ask-donald-knuth/SKILL.md),
[John Ousterhout](skills/engineering/ask-john-ousterhout/SKILL.md),
[Kent Beck](skills/engineering/ask-kent-beck/SKILL.md),
[Linus Torvalds](skills/engineering/ask-linus-torvalds/SKILL.md),
[Martin Fowler](skills/engineering/ask-martin-fowler/SKILL.md), or
[Rich Hickey](skills/engineering/ask-rich-hickey/SKILL.md).

### Specialized

- [nextjs-feature-architecture](skills/engineering/nextjs-feature-architecture/SKILL.md)
  — Assign owners and boundaries in a Next.js App Router feature.

See the [engineering catalog](skills/engineering/README.md) for invocation
details.

## License

Released under the [MIT License](LICENSE).
