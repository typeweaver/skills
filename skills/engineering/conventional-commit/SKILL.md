---
name: conventional-commit
description: Commit finished work with Conventional Commits. Use when asked to
  stage or commit changes, write a commit message, or split work into commits.
---

# Conventional Commit

Turn the finished diff into commits that can each be reverted without breaking
the build or tests. Keep code with the tests that cover it.

Read every staged and unstaged diff before deciding what belongs together.
Derive the split, type, and scope from the changes, not the ticket or branch.
Check recent commit subjects for an established scope; omit the scope if none
fits the area.

Before staging, scan both diffs for credentials, tokens, private keys, `.env`
contents, and internal hostnames the repository does not already publish.
Unstage and withhold any affected file, then report it.

Stage each commit by path. Confirm that only its intended changes are staged,
commit, and read `git show` to check its contents and message. Continue until
every task change is committed or reported as withheld. Leave unrelated work
in the tree. Avoid `git add -A`, `git add .`, and `git commit -a` because they
can sweep it into a commit.

## Message

Use Conventional Commits even if earlier history differs. Write the subject,
body, and footers in English. Use `<type>(<scope>): <imperative description>`
or omit the scope when none fits. Add a body when the reason is not clear from
the diff; skip a restatement of the subject or a file list. Mark a breaking
change with `!` or a `BREAKING CHANGE:` footer only when an existing caller,
consumer, or configuration must change.

Create new commits. Amend or rewrite an existing commit only when asked. Let
hooks run; fix a failure or report it. Stop after committing unless the user
also authorized the next action, such as pushing or opening a pull request.
