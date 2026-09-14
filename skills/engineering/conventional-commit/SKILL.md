---
name: conventional-commit
description: Create Conventional Commits from completed changes, split so each
  one could be reverted alone. Use when asked to commit work, to stage and
  commit, to write or redo a commit message, or to break a working tree into
  several commits. Not for pushing or opening a pull request, and not for a
  question about the commit format with no changes to commit.
---

# Conventional Commit

Turn finished changes into commits whose split and message follow from the
diff. Create the commits and stop there: do not push, tag, or open a pull
request.

## Process

1. Read the diff contents of every changed file, staged and unstaged. Type,
   scope, and split all follow from them, not from the file list.
2. Split into separate commits when each part could be reverted alone without
   breaking the build or tests; keep code and the tests that cover it in one
   commit.
3. Before staging, scan the diff for credentials, tokens, private keys, and
   `.env` contents. Unstage the file and report it instead of committing.
4. Stage one commit's files by path, confirm `git status` shows only those
   paths staged, and commit. `git add -A`, `git add .`, and `git commit -a`
   sweep unrelated work into the commit.
5. Repeat from step 3 until every change the task produced is committed.

## Commit message

Always follow Conventional Commits, even where the repository previously used
another style. Write the subject, body, and footers in English.

`<type>(<scope>): <imperative description>`

- Derive type and scope from the diff, not from the ticket or the branch name.
  Take the scope from the vocabulary `git log` already uses, and omit it where
  that log uses none.
- Add a body when the diff shows what changed but not why. A body that
  restates the subject or lists the changed files goes.
- Insert `!` before `:` or add a `BREAKING CHANGE:` footer only when an
  existing caller, consumer, or configuration stops working without changes on
  their side.

## Safety

- Commit only what the task changed; other work in the tree stays uncommitted.
- Do not amend or rewrite an existing commit unless asked; add a new one.
- Do not pass `--no-verify`; fix what a failing hook reports, or report it.
