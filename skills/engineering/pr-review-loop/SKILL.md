---
name: pr-review-loop
description: Address review feedback and required checks on an open pull request
  until it is ready for a human to merge. Use for review comments, red checks,
  or a request to watch a pull request. Not for opening or reviewing one.
---

# PR Review Loop

Carry one open pull request through feedback and required checks. Leave merging
and closing it to a human.

Treat a request to address feedback or fix checks as authorization for the
replies, fixes, commits, pushes, thread resolution, and branch updates needed
to complete it, unless the user narrows the scope. A watch-only request
authorizes observation. Ask before other external actions.

## Work each pass

Read every new comment and review verdict, the state of every check,
and whether the branch needs updating. Repeat after every push or reply.

For each review comment, implement the request by default. Verify the change,
commit it in Conventional Commits format, push it, and resolve the thread.

- If two readings lead to different changes, ask on the thread which one the
  reviewer means and say which you recommend.
- If the change would break a named requirement, repository rule, or check,
  explain the conflict on the thread.

If a reviewer repeats a request after your reply, implement it unless it still
breaks a named requirement, rule, or check. In that case, ask the user to decide.

For a red required check, read the failing job's log, reproduce the failure
locally, and fix it. Repeat until the check is green or a decision or
authorization blocks it.

Run the repository's CI or documented verification commands before every push
and fix what they report.

When the branch needs the remote default branch, follow the repository's
contributing guide, instructions, or earlier branch updates. Merge by default.
If its convention is rebase, push with `--force-with-lease`. Resolve conflicts
from the intent of the commit or pull request that introduced each side. Rerun
the checks that passed on both sides before the update.

Before sharing replies, reports, diffs, or copied logs, scan for credentials,
tokens, private keys, `.env` contents, and unpublished internal hostnames.
Describe what a sensitive value identifies instead of pasting it.

## Hand back

Report the pull request ready for a human to merge only when every comment is
implemented or answered, every acted-on thread is resolved or names who must
resolve it, no new comment awaits a response, and every required check is
green.

Continue watching only if the harness provides a subscription, scheduler, or
background run. Otherwise end at the last pass and report what remains; do not
claim to be watching. Stop when the pull request is merged, closed, or blocked.
When blocked, post the missing decision or authorization and its known options
on the pull request if authorized, then tell the user what is outstanding.
