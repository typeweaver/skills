---
name: conventional-commit
description: Create logical Conventional Commits from completed changes. Use
  when committing work, drafting a commit message, or splitting changes into
  coherent commits.
---

# Conventional Commit

Create one coherent, verifiable history entry from the actual changes.

## Process

1. Inspect Git status and the relevant staged and unstaged diffs.
2. Derive the intent from the changes and task context.
3. Split independently understandable concerns; keep tightly coupled code and
   tests together.
4. Stage only the intended files, commit them, and verify the resulting diff and
   message.

## Commit message

Always follow Conventional Commits, even when the repository previously used a
different style. Apply compatible repository conventions without weakening the
specification.

Write the subject, body, and footers in English:

`<type>(<scope>): <imperative description>`

- Derive type and scope from the diff, not the ticket or branch name.
- Omit the scope when it adds no meaning.
- Keep the subject concise, specific, imperative, and without a final period.
- Add a body only when motivation or consequences are not obvious.
- Insert `!` before `:` or add a `BREAKING CHANGE:` footer only for genuine
  breaking changes.

## Safety

- Preserve unrelated work and never commit secrets.
- Do not amend or rewrite history unless explicitly requested.
