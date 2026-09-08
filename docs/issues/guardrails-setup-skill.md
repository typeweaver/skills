# Add a guardrails setup skill for TypeScript projects

## Context

Everything a machine enforces, an agent no longer has to remember, yet no skill
in this catalog or in the wider ecosystem sets a project up with hard
guardrails; existing skills are linter or TypeScript "expert" prompts.
TypeScript 7 changed the baseline (`strict` and `types: []` are defaults,
`baseUrl` is gone), and oxlint's type-aware rules now cover 59 of 61
typescript-eslint rules but require TypeScript 7.

## Goal

A setup skill, triggered by "harden this project" or "set up guardrails", that
discovers the target toolchain, proposes and wires strict checks into CI, and
records them in the project's agent instructions. Implementation-time behavior
stays in `craft-it`.

## Acceptance criteria

- Skill under `skills/engineering/` with `SKILL.md` and `agents/openai.yaml`;
  description limited to the setup trigger.
- Proposes, with a reason each: strict compiler extras
  (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`,
  `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax`,
  `noImplicitOverride`), a type-aware linter (oxlint with `oxlint-tsgolint` on
  TypeScript 7, typescript-eslint strict-type-checked otherwise), a formatter,
  dead code and unused dependencies (knip), module boundaries and cycles
  (dependency-cruiser or equivalent), supply-chain settings (pnpm
  `minimumReleaseAge`), and workflow auditing (zizmor) when workflows exist.
- Discovers the repository's existing tools and versions instead of copying
  this repository's configuration; never encodes organization policy.
- Wires every check into CI as a gate and documents them in the target's
  agent instructions.
- Forward test on a fresh TypeScript project recorded; READMEs updated;
  `./scripts/check-skills.sh` passes.

## References

- `skills/engineering/craft-it/SKILL.md`
- https://typescriptdocs.com/release-notes/TypeScript%207.0
- https://oxc.rs/docs/guide/usage/linter/type-aware.html
- https://knip.dev , https://github.com/sverweij/dependency-cruiser
