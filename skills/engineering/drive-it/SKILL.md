---
name: drive-it
description: Run the complete engineering workflow from an idea to a merged
  pull request. Use only when the user explicitly invokes this orchestrator,
  not for isolated planning, implementation, or review.
disable-model-invocation: true
---

# Drive It

The user wants one idea taken to a merged pull request. Coordinate the focused
skills without restating their rules, keep `aurelius` as the mindset, and
resume at the earliest incomplete phase.

1. **Understand** — use `challenge-me` until outcome and boundaries are
   confirmed; skip when they are already clear.
2. **Plan** — use `plan-it`; the result may be one milestone or a roadmap of
   several. Recommend a scaffold when the work changes ownership, public
   contracts, dependency direction, data flow, or package boundaries. Present
   the scaffold-ready plan and recommendation with `brief-me`; ask once for
   approval to execute the plan and whether to add the structure checkpoint.
   Default one implementation pull request per milestone.
3. **Scaffold when approved** — use `scaffold-it`, then `review-it`,
   `conventional-commit`, and `create-pull-request` to present the plan and
   scaffold as their own review layer. Ask the human to approve the reviewed
   baseline before implementation. While the scaffold pull request is open,
   branch implementation from its head and target that scaffold branch so the
   relationship is explicit. Merge the scaffold first only when it is
   independently green, inert, and useful; then sync the implementation branch
   onto the remote default branch and verify its target before review.
4. **Build** — derive the goal with `define-goal`, set it as the active
   objective in the harness when it supports one. Branch from the approved
   scaffold layer when that checkpoint exists; otherwise branch from the remote
   default branch. Implement with `craft-it`.
5. **Ship** — before each commit: run `review-it`, fix the justified findings,
   record Follow-ups with `to-issues`, and commit with `conventional-commit`.
   Open the pull request with `create-pull-request` and run `review-it` once
   over the complete diff before it leaves draft. Compare the implementation
   with the approved scaffold, confirm every material difference is recorded
   under `Scaffold deviations`, and review each entry's evidence and contract
   and test consequences explicitly. Expert lenses
   (`ask-rich-hickey`, `ask-martin-fowler`, `ask-kent-beck`,
   `ask-john-ousterhout`, `ask-barbara-liskov`, `ask-linus-torvalds`,
   `ask-donald-knuth`) are never required for a review: add one — or several —
   only when you are confident the perspective materially sharpens it. Repeat
   Build and Ship for each approved milestone.
6. **Deliver** — summarize with `brief-me`, ask one bundled question covering
   tracker synchronization and reviewer requests, then run `pr-review-loop`,
   implementing justified review feedback autonomously, until every pull
   request is merged by a human or genuinely blocked.

Work autonomously: research, decide, and resolve what you can yourself instead
of interrupting the user. Interrupt only when new evidence invalidates the
approved outcome, required authority is unavailable, or a step risks serious
irreversible damage. Never merge yourself, and never publish external issues,
deploy, or release without the matching explicit authorization.
