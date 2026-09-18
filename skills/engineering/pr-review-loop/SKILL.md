---
name: pr-review-loop
description: Work an open pull request's review comments and checks until a
  human merges it. Use when asked to address or answer review feedback
  on a pull request, to fix a red check on one, or to watch or keep an eye on a
  pull request until it can be merged. Not for opening a pull request and not
  for reviewing a diff yourself.
---

# PR Review Loop

Carry one open pull request until a human merges it: answer every review
comment and keep its required checks green. Never merge or close the pull
request; report it merge-ready and leave both to a human.

Every reply, report, and pushed diff is visible to everyone who can see the
pull request. Check each for credentials, tokens, private keys, `.env`
contents, and internal hostnames the repository does not already publish, and
name what the value identifies instead of pasting it; copied check output and
log excerpts are where they leak.

## Watch

Decide first whether you can watch at all. When the harness offers no
subscription, scheduler, or background run, this run ends at the last pass you
can make: say that you cannot watch past this run and hand back what is
outstanding, and do not report that you are watching.

Re-check the pull request after every push and every reply. One pass reads
every new review comment, every new review verdict, and the state of every
check.

## Answer every review comment

Take Agree unless one of the other tests fires.

- **Agree** — make the change, verify it, call the Skill tool with
  `conventional-commit`, push it, and resolve the thread.
- **Unsure** — two readings of the comment lead to different changes: ask on
  the thread the question that separates them and say which you would take.
- **Disagree** — you can name what implementing it would break: reply on the
  thread with that failure.

When a reviewer repeats a request after your reply, implement it; refuse only
when you can name the check it fails, the repository rule it breaks, or the
requirement it contradicts, and then ask the user to decide.

## Keep the branch mergeable

- Run the check command CI runs or the verification commands the repository
  documents before every push, and fix what they report. For a red required
  check, one pass reads the failing job's log, reproduces the failure locally,
  fixes it, and pushes; repeat until the check is green. When it needs an
  authorization or decision you cannot obtain, it blocks you.
- Update the branch from the remote default branch with the convention the
  repository uses: its contributing guide, its repository instructions, or how
  the branch's earlier updates were made. Merge the default branch in when none
  of them says; under rebase, push with `--force-with-lease` and never a plain
  `--force`.
- Resolve a conflict by the intent of each side traced to the commit or pull
  request that introduced it. The checks that passed on both sides before the
  update must pass after it.

## Report merge readiness

The pull request is merge-ready when:

- every review comment is implemented, asked about, or answered with a reason,
- every thread you opened or acted on is resolved or names who must resolve it,
- no newer review comment is waiting,
- every check the pull request marks required is green.

Report that, then keep watching. Stop when the pull request is merged, closed,
blocked, or when this run ends because the harness cannot watch past it — and
then hand back what is outstanding. Blocked: a required check, decision, or
authorization cannot be obtained by the agent and the request has been posted
or reported. Post that request in the pull request, naming the options when you
know them.
