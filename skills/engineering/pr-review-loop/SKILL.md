---
name: pr-review-loop
description: Work an open pull request's review comments and required checks until a human can merge it.
  Use when asked to address feedback, fix red checks, or watch a pull request.
  Not for opening a pull request or reviewing its diff yourself.
---

# PR Review Loop

Carry one open pull request through review and required checks until it is ready for a human to merge.
Do not merge or close the pull request.

A request to address feedback or fix checks authorizes the replies, fixes, commits, pushes, thread resolution,
and branch updates needed to complete it,
unless the user narrows the scope.
A request only to watch authorizes observation.
Ask before other external actions.

## Work each pass

Read every new review comment and verdict, the state of every check, and whether the branch needs updating.
Repeat after every push or reply.

Implement a review comment by default,
verify the change, commit in Conventional Commits format, push, and resolve the thread.

- If two readings would lead to different changes,
  ask on the thread which the reviewer means and say which you recommend.
- If the request would break a named requirement, repository rule, or check, explain the conflict on the thread.

If a reviewer repeats a request after your reply, implement it unless that conflict remains.
Then ask the user to decide.

For a red required check, read the failing job's log, reproduce the failure locally, and fix it.
Repeat until the check is green or a decision or authorization blocks the work.

Run the checks CI runs or the repository documents before every push, and fix what they report.

Before sharing replies, reports, diffs, or copied logs,
check for credentials, tokens, private keys, `.env` contents, and unpublished internal hostnames.
Describe what a sensitive value identifies instead of pasting it.

## Keep the branch mergeable

Update the PR branch from the remote default branch when needed,
following the repository's contributing guide, instructions, or earlier branch updates.
If none sets a convention, merge the default branch into the PR branch.

If the convention is rebase, push with `--force-with-lease`, never a plain `--force`.
Resolve conflicts using the intent of the commit or pull request that introduced each side.
Checks that passed on both sides before the update must pass after it.

## Hand back

Report the pull request ready for a human to merge only when:

- Every review comment is implemented or answered.
- Every thread you opened or acted on is resolved or names who must resolve it.
- No new comment awaits a response.
- Every required check is green.

Continue watching only if the harness provides a subscription, scheduler, or background run.
Otherwise end at the last pass, say that you cannot watch beyond it, and report what remains.
Stop when the pull request is merged, closed, or blocked.

When blocked, post the missing decision or authorization and its known options on the pull request if authorized,
then tell the user what is outstanding.
