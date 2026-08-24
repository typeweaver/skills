# Repository Guidelines

This repository owns reusable agent skills and thin agent adapters. Keep it
small, explicit, and portable across supported agent harnesses.

## Structure

- Put stable software-engineering skills under `skills/engineering/<name>/`.
- Every skill directory requires `SKILL.md` and `agents/openai.yaml`.
- Define each agent once in `agents/<name>/agent.yaml` plus `instructions.md`.
  The harness adapters (`claude.md`, `opencode.md`, `codex.toml`,
  `codex-profile.toml`) are generated from that source with
  `typeweaver-skills generate` and stay committed; never edit them by hand.
- Keep the installer CLI in `cli/`; it bundles `skills/` and `agents/` into
  the published package at pack time.
- Keep optional scripts, references, and assets inside the skill that owns them.
- Keep `CLAUDE.md` as a symlink to `AGENTS.md`; do not duplicate repository
  instructions by harness.
- Keep the top-level `README.md` and the relevant bucket `README.md` in sync
  with every added, renamed, moved, or removed skill.
- Keep `agents/README.md` and the top-level `README.md` in sync with agent
  changes.
- Use `scripts/` only for repository-wide maintenance helpers.

## Writing skills

- Write reusable instructions and repository documentation in English.
- Match the directory name and the `name` field in `SKILL.md` exactly.
- Design from concrete trigger examples, the behavior or knowledge the skill
  must add, and its expected output. Give each skill one clear responsibility.
- Use model invocation when the agent can usefully discover the skill from the
  task context. Use user-only invocation only for workflows that should start
  exclusively by an explicit human command, and encode that choice for every
  supported harness.
- Give every `agents/openai.yaml` a `display_name`, `short_description`, and
  `default_prompt`. Declare invocation policy only when it deviates from the
  harness default of implicit invocation, mirroring the frontmatter convention.
- Keep the frontmatter `description` to the outcome and every automatic trigger
  context. Do not summarize the body there.
- Assume a capable agent. Teach only the specialized mindset, domain knowledge,
  judgment, constraints, procedure, or output contract that changes its
  behavior.
- Use short imperative actions and scannable bullets. Omit origin stories,
  rhetorical setup, broad advice, and explanations of obvious steps.
- Match specificity to risk: use principles for contextual judgment and exact
  sequences only for fragile or consistency-critical work.
- Keep cross-skill routing in orchestrators. Focused skills must remain useful
  without companion skills.
- Keep one source of truth for each rule and disclose branch-specific detail
  through clearly named reference files.
- After behavior is correct, run a separate compression pass. Remove repeated
  introductions, conclusions, checklists, description/body overlap, and rules
  owned by another skill without weakening safeguards or output contracts.
- Forward-test substantial or behavior-sensitive revisions with clean context
  when practical, then refine the skill from observed behavior.
- Keep organization-, team-, and person-specific policy out of reusable skills.
  Discover and follow such policy from the target repository at execution time.

## Writing agents

- Use agents for execution context, role, tool boundaries, or context isolation;
  keep reusable knowledge and procedures in skills.
- Keep adapters thin. Route to skills by name instead of copying their rules.
- Preserve the same role and safety boundary across harnesses while using each
  harness's native format.
- Prefer a small set of durable roles over overlapping specialist agents.

## Safety

- Preserve unrelated working-tree changes.
- Do not commit, push, publish, request external review, or merge unless the
  user explicitly asks for that action.
- Do not weaken approval gates while adapting a skill to another harness.
- Treat existing skill behavior as deliberate until a requested revision says
  otherwise.

## Verification

Run these checks after changing the repository:

```bash
bash -n scripts/*.sh
./scripts/check-skills.sh
./scripts/check-agents.sh
./scripts/link-skills.sh --dry-run
./scripts/link-agents.sh --dry-run
pnpm check
git diff --check
```

Inspect the final diff and Git status before handing work back.
