---
name: pr-review-loop
description: Handle review feedback and checks on an open pull request until a
  human merges it. Use when asked to monitor or continue an active PR.
---

# PR Review Loop

Own the review-feedback loop for an open pull request.

Never merge the pull request.

## Monitor

After the PR is created:

- Subscribe to review activity when the environment supports it.
- Otherwise periodically re-check for new reviews, comments, and threads.
- If subscriptions or scheduled checks are not possible, report that limitation instead of pretending to monitor.

Continue monitoring and handling feedback until a human merges or closes the
pull request, or it is genuinely blocked.

## Handle feedback

For each new review comment:

- **Agree:** implement the improvement, verify the change, push it, and resolve the thread.
- **Unsure:** reply on the thread with the smallest necessary clarification question.
- **Disagree:** explain the reasoning on the thread instead of silently ignoring the feedback.

If a reviewer reiterates a requested change after your explanation, implement it unless it conflicts with higher-priority requirements, correctness, security, or safety. Escalate such conflicts instead.

After every change, check again for new feedback.

## Keep the branch healthy

- Keep the branch current with the remote default branch: merge its updates in
  and resolve merge conflicts autonomously, preserving the intent of both
  sides.
- After every merge or update, rerun the relevant quality gates — linting,
  tests, and required checks — and fix what they surface before pushing.

## Finish

The PR is merge-ready when:

- all actionable review feedback has been implemented or explicitly clarified,
- all resolvable review threads are resolved,
- no newer review feedback is waiting,
- relevant required checks pass.

Report merge readiness, keep watching for new feedback, and stop only when the
pull request is merged, closed, or genuinely blocked.

When blocked, report what prevents further progress and what is needed to continue in the relevant PR thread. If progress requires a human decision, request that decision explicitly and state the available options when known.
