# Typeweaver Skills

Opinionated software-engineering skills and thin agent adapters for coding
agents.

## Language

**Skill**:
A document an agent runs that changes what the agent does.
_Avoid_: prompt, playbook, command

**Model-invoked**:
A skill the agent may discover from task context.
_Avoid_: implicit, auto-invoked

**User-only**:
A skill that starts only by an explicit human command, encoded for every
supported harness.
_Avoid_: user-invoked

**No-op**:
A skill sentence the agent would follow if the sentence were deleted.
_Avoid_: filler, redundancy

**Frontier**:
In `challenge-me`, every consequential decision that is neither settled nor
deferred and whose prerequisites are settled.
_Avoid_: backlog, open questions

**Shared understanding**:
The confirmed summary of outcome, boundaries, and next artifact after
`challenge-me`.
_Avoid_: recap, notes, takeaways

**Glossary**:
The project's canonical domain language in root `GLOSSARY.md`: what a thing
is, rejected synonyms, and relationships.
_Avoid_: CONTEXT.md, spec, ubiquitous-language document

**Orchestrator**:
A skill that coordinates other skills by name without copying their rules.
_Avoid_: workflow engine, meta-skill

**Harness**:
The agent runtime that loads skills and adapters: Claude Code, Codex,
OpenCode, or Kiro.
_Avoid_: IDE, platform, tool

**Adapter**:
A generated, harness-specific file derived from `agents/<name>/`. Not edited
by hand.
_Avoid_: wrapper, shim

**Expert lens**:
An `ask-*` skill that judges one decision through a named engineer's
principles without replacing the active workflow.
_Avoid_: specialist agent

## Relationships

- A **Skill** is **Model-invoked** or **User-only**
- An **Orchestrator** is a **User-only** **Skill**
- An **Expert lens** is a **Model-invoked** **Skill**
- `drive-it` is the **Orchestrator** in this repository
- The **Glossary** defines terms used by **Skills**; it does not hold their
  procedures
- A **Harness** loads **Skills** and **Adapters**

## Flagged ambiguities

- **"Command"** — a harness slash command invokes a skill; a skill is not a
  command.
- **"Context"** — the model context window is not domain language. The
  language file is the **Glossary**, never `CONTEXT.md`.
- **"Persona"** — `ask-*` skills and the catalog still say this. Canonical:
  **Expert lens**. Leave it until those files change.
