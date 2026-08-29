# typeweaver-skills

Filesystem-safe installer for Typeweaver's reusable engineering skills and
native agent adapters.

## Install

Run the guided installer:

```bash
npx typeweaver-skills install
```

It detects harnesses, lets you select skills and agents, and asks whether
harness-specific skill projections should be symlinks or copies when relevant.

For automation, select every consumer explicitly and skip prompts:

```bash
npx typeweaver-skills install \
  --claude-code --codex --opencode --kiro \
  --skills all --agents all --yes
```

`--yes` only skips prompts. It never enables `--force`.

## Skill layout

Skills are installed once into `~/.agents/skills`. By default, Claude Code and
Kiro receive directory symlinks to that canonical copy. Codex and OpenCode read
the canonical location directly.

Use `--copy` when every harness should receive an independent skill directory:

```bash
npx typeweaver-skills install --claude-code --kiro --skills all --agents none --copy
```

If the operating system does not permit directory symlinks, the command rolls
back and asks you to rerun it with `--copy`. It never changes the planned mode
silently.

Agent adapters are always copied into each harness's native configuration
location. Kiro receives skills only.

## Commands

| Command     | Purpose                                                        |
| ----------- | -------------------------------------------------------------- |
| `install`   | Add the selected skills, agents, and harness consumers         |
| `update`    | Refresh exactly the components recorded by the current receipt |
| `doctor`    | Inspect roots, receipt, transaction state, and installed files |
| `uninstall` | Remove the complete installation or an explicit subset         |

Every filesystem lifecycle command supports `--dry-run`. `install` and `uninstall` also
accept comma-separated names through `--skills` and `--agents`; use `all` or
`none` for an explicit whole-category selection.

## Existing files and `--force`

The installer plans the complete command before changing the filesystem.

- Missing destinations are created.
- Exact package content and exact expected symlinks are adopted during an
  explicit install. This makes an existing `skills.sh` installation easy to
  take over without rewriting it.
- Foreign or locally modified content stops the entire command before any
  mutation.
- `--force` resolves those conflicts by replacing the complete selected skill
  or agent component. Replaced content is not retained in a backup store.
- Changing an installed skill between symlink and copy mode also requires
  `--force`.

`--force` is intentionally destructive inside the selected component boundary.
It does not weaken path containment: a symlinked harness root, state root, or
ancestor is always rejected. If the selected component itself is a symlink,
the installer unlinks only that symlink and never changes its target.

Preview a takeover before accepting that boundary:

```bash
npx typeweaver-skills install --claude-code --skills all --agents none --force --dry-run
npx typeweaver-skills install --claude-code --skills all --agents none --force
```

## Updates

`update` requires a valid Receipt v2 and preserves the recorded component
selection, harness consumers, and skill projection mode. It does not install
newly published skills or agents merely because they exist in a newer package.

An update replaces files that still match the previously installed hashes and
removes obsolete managed files. Local modifications are conflicts; pass
`--force` to discard them for the affected selected component.

## Uninstall

With no selection flags, `uninstall` removes the complete recorded
installation:

```bash
npx typeweaver-skills uninstall --dry-run
npx typeweaver-skills uninstall
```

A scoped uninstall can remove selected components or only selected harness
consumers. It requires a valid receipt so that remaining consumers stay intact:

```bash
npx typeweaver-skills uninstall --claude-code --skills aurelius
```

Modified managed files stop uninstall unless `--force` is supplied. If the
receipt is missing, a full uninstall removes only artifacts that exactly match
the current package; `--force` may remove conflicting package-named components.
After a successful full uninstall, the receipt and temporary transaction state
are removed. There is no persistent cache or backup store.

## Crash safety

Mutations use an exclusive lock, same-filesystem temporary backups, a journal,
and an atomic receipt replacement. A failed command rolls back its changes. A
later mutating command recovers an interrupted transaction before planning new
work; `doctor` reports pending recovery without modifying anything.

## Source

Skills, agents, and this CLI live in
[typeweaver/skills](https://github.com/typeweaver/skills). Published packages
bundle their content at pack time, including the license, so installation does
not fetch repository files at runtime.
