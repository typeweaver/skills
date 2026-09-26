---
name: to-issues
description: Record deferred work as issues someone can pick up later. Use for
  follow-ups from reviews, plans, roadmaps, or an active change when the user
  asks to file, track, or park the work.
---

# To Issues

Turn work outside the current change into issues someone can complete and close.
If the agreed outcome depends on the work, do it now instead of deferring it.

## Decide what to record

Read the source of each item and existing issues. Record one issue per outcome
that can ship independently. Add new evidence to an existing issue when it
already covers the outcome.

Keep a plan as the technical source of truth: make one issue for its outcome
and link the plan. For a roadmap, make an umbrella issue and an issue for each
milestone that ships independently.

## Choose where it lives

Use one destination per issue:

- Publish to an external tracker only when the user has explicitly authorized
  creating or updating issues there. Naming a tracker is not authorization.
- Otherwise follow the repository's local issue convention, or write one
  Markdown file per issue under `docs/issues/`.
- If repository writes are outside the authorized scope or no workspace exists,
  return drafts in the response.

When authorized to publish an existing local issue, move it to the tracker and
remove the local record, unless the repository requires a mirror.

## Write for the next person

Use [the issue template](assets/issue-template.md). State the outcome, why it
matters, and evidence that will show it is done. Trace every acceptance
criterion to the source; leave out plausible but unrequested edge cases.
Include labels, priorities, owners, and implementation details only when sourced.
Link to plans, code, reviews, or logs instead of copying them. Describe secrets
and unpublished internal values by purpose rather than pasting them.

Report the local paths and tracker links created, and identify any item left
as a draft. Distinguish a draft from a published issue.
