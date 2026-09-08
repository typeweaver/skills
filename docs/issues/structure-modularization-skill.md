# Add a structure and modularization skill with concrete triggers

## Context

`craft-it` states the principles (cohesion, directed coupling, no cycles,
extract concepts not fragments) and `ask-john-ousterhout` is the judgment
lens, but principles do not trigger behavior: agents place files where the
neighbors are and never restructure. No operative skill for this exists in the
ecosystem. Checkable triggers exist in the literature (Ousterhout's red flags,
Feature-Sliced Design's import rules) and boundary allowlists in CI show how to
enforce them.

## Goal

An operative skill of about 40 lines with its own trigger ("clean up this
folder", "this file keeps growing", or the agent noticing mixed
responsibilities) that names when to move or split code and how to do it in a
separate commit. `craft-it` routes to it by name and gains three to four lines
on tests and dependencies at the same time.

## Acceptance criteria

- Skill under `skills/engineering/` with `SKILL.md` and `agents/openai.yaml`.
- Lists concrete triggers with the action each demands, among them: a folder
  whose files change for different reasons, a file exporting more than one
  concept, sideways imports between peers, a module imported by two peers
  without shared lifecycle, name-by-type dumping grounds (`utils`, `helpers`).
- Procedure: inventory, target, move, fix imports, verify, separate commit
  from behavior changes; how to read an existing boundary allowlist as
  evidence.
- Naming by concept; colocation rules; barrel-file caution.
- `craft-it` references the skill and adds: fakes before mocks, delete tests
  that restate the implementation, no new dependency without a stated reason.
- Forward test on a real folder with mixed concerns recorded; READMEs
  updated; `./scripts/check-skills.sh` passes.

## References

- `skills/engineering/craft-it/SKILL.md`, `skills/engineering/ask-john-ousterhout/SKILL.md`
- https://feature-sliced.design/docs/get-started/overview
