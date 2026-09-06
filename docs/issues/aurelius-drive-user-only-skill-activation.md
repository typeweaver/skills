# Make aurelius-drive reliably load user-only drive-it

## Context

Selecting the `aurelius-drive` agent is the human invocation of `drive-it`
(`initialPrompt: /drive-it` on Claude). `drive-it` is user-only
(`disable-model-invocation: true`). On Claude this has already failed in a
fresh agent session: the agent wants to activate `drive-it` itself, but the
harness may not expose a user-only skill to model invocation after the
session starts.

Origin: 2B CLI review, `agents/aurelius-drive/instructions.md`.

## Goal

On every supported harness, selecting `aurelius-drive` loads `aurelius` and
`drive-it` for the whole session without the model having to invoke a
user-only skill a second time.

## Acceptance criteria

- Documented, tested start path for Claude, Codex, and OpenCode.
- A fresh `aurelius-drive` session can run the drive-it workflow without a
  second explicit `/drive-it` from the user.
- User-only remains the rule for `drive-it` outside this agent.

## References

- `agents/aurelius-drive/instructions.md`
- `agents/aurelius-drive/agent.yaml`
- `skills/engineering/drive-it/SKILL.md`
