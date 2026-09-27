---
name: to-issues
description: Record follow-up work, review findings, plans, or roadmap milestones as issues someone can complete later.
  Use when asked to file, track, or park that work, or to publish it to an authorized tracker.
  Not for work the current change still needs or for leaving a TODO in source.
---

# To Issues

Your task is to record work that can wait as issues someone else can complete and close.
If there is a current change, defer an item only when that change is correct and meets the agreed outcome without it.
Fix a defect in the current change now, even if an issue would be easier to write.

## Decide what to record

Read the source of each item and the records that already exist.
Make one issue per outcome that can be delivered and closed on its own.
Add new evidence to an existing issue when it already covers that outcome.

Keep a plan as the technical source of truth and make one issue for its outcome that links to it.
For a roadmap, make an umbrella issue and one issue per milestone that ships independently.

## Choose the destination

Record each outcome in one place.
Publish to an external tracker only when the user has explicitly authorized creating or updating issues there.
Naming a tracker is not authorization.
Otherwise follow the repository's local issue convention, or write one Markdown file per issue under `docs/issues/`.
Local records need no separate authorization when repository changes are already approved.
When repository writes are outside the authorized scope or no workspace exists, return issue drafts in the response.

When authorized to publish an existing local issue, move it to the tracker and remove the local file in the same change.
Keep a local mirror only where the repository requires one.

## Write the issue

Use [the issue template](assets/issue-template.md) and the source context.
State the outcome, why it matters, and the evidence that will show it is done.
Include a requirement, label, priority, owner, or implementation detail only when the source supports it.
Add status or date fields only where the repository already uses them.

Link to plans, code, reviews, or logs instead of copying them into the issue.
Do not put credentials, tokens, private keys, `.env` contents, or unpublished internal hostnames in a record.
Describe what a value identifies instead.

## Finish

Report created local paths and tracker links, and identify any item left as a draft or not created.
If the user named a tracker but did not authorize publication,
say that nothing was published there and offer to publish on their authorization.
