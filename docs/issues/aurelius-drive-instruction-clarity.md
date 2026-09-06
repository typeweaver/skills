# Rewrite aurelius-drive instructions in plain language

## Context

The five-line instruction body is too dense. “Keep requirements, decisions,
approvals, and the final synthesis in this context” and “delegate only
bounded work that benefits from fresh or isolated context” do not name
subagents or say what must stay in the primary session.

Origin: 2B CLI review, `agents/aurelius-drive/instructions.md`.

## Goal

An engineer reading the instructions knows: this session owns the
conversation; which facts must not leave it; when to start a subagent; and
that subagents are the isolation mechanism.

## Acceptance criteria

- Instructions name subagents explicitly where isolation is required.
- Primary-session ownership (requirements, decisions, approvals, final
  synthesis) is stated without jargon.
- Generated adapters stay in sync (`pnpm generate:check`).

## References

- `agents/aurelius-drive/instructions.md`
- `agents/aurelius-drive/agent.yaml`
