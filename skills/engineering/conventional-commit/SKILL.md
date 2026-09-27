---
name: conventional-commit
description: Create Conventional Commits from completed changes. Use when asked
  to stage or commit work, write or revise a commit message, or split work into
  separate commits. Not for pushing, tagging, opening a pull request, or
  explaining the format when there is nothing to commit.
---

# Conventional Commit

Turn finished work into commits that can each be reverted without breaking the build or tests.
Create the commits and stop there.

## Method

Read every changed file's staged and unstaged diff before deciding what belongs together.
Split independent changes, but keep code and the tests that cover it in one commit.

Before staging, scan both diffs for credentials, tokens, private keys, `.env` contents, and internal hostnames the repository does not already publish.
Unstage and withhold any affected file, then report it.

Stage one commit by path and check `git status` for unintended staged changes.
Do not use `git add -A`, `git add .`, or `git commit -a`; they can sweep unrelated work into the commit.

Commit, then read `git show` to confirm the contents and message.
Repeat until every change the task produced is committed or reported as withheld.
Leave unrelated work in the tree.

## Message

Use Conventional Commits even if the repository's earlier history differs.
Write the subject, body, and footers in English.

Use `<type>(<scope>): <imperative description>`, or omit the scope when none fits.
Derive type and scope from the diff, not the ticket or branch name.
Check `git log --oneline -20` for the scope used in this area; do not invent one when none exists.

Add a body when the diff shows what changed but not why.
Leave out a body that only restates the subject or lists files.
Mark a breaking change with `!` or a `BREAKING CHANGE:` footer only when an existing caller, consumer, or configuration needs a change on its side.

## Boundary

Do not amend or rewrite an existing commit unless asked; add a new one.
Let hooks run. Do not pass `--no-verify` or `-n`; fix a failing hook or report it.

Do not push, tag, or open a pull request as part of this skill.
If the user also authorized one of those actions, follow its own workflow after committing.
