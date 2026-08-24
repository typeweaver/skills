# typeweaver-skills

Reusable software-engineering skills and specialized agents for Claude Code,
Codex, and OpenCode — plus skills for Kiro.

## Install

```bash
npx typeweaver-skills install
```

The guided setup detects your harnesses and lets you choose what to install.
For agents and automation, pass explicit flags instead:

```bash
npx typeweaver-skills install --claude-code --codex --opencode --kiro --skills all --agents all --yes
```

## Commands

| Command     | Purpose                                                   |
| ----------- | --------------------------------------------------------- |
| `install`   | Install skills and agents into the selected harnesses     |
| `update`    | Refresh every managed file from this package version      |
| `doctor`    | Verify the installation (paths, versions, modified files) |
| `uninstall` | Remove exactly the files the installer manages            |

The installer never changes files outside its own package on a plain
`npm install`, never silently overwrites files you edited, and re-runs are
idempotent.

## Source

Skills, agents, and this CLI live in
[typeweaver/skills](https://github.com/typeweaver/skills). The package bundles
the content at pack time, so installs are offline-capable and reproducible.
