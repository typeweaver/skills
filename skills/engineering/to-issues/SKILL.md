---
name: to-issues
description: Preserve plans, findings, or follow-up work as actionable issue
  records. Use when deferred work needs local tracking or the user authorizes
  synchronization to an external tracker.
---

# To Issues

Preserve actionable work without expanding the current implementation.

## Choose the destination

Record each outcome in exactly one place.

- **External tracker when authorized:** if the user names or approves a
  tracker, create the issues there and nowhere else. Write local records only
  when the repository's conventions require a local mirror.
- **Local otherwise:** follow an existing repository convention; else write
  one Markdown file per independent outcome under `docs/issues/` using
  [assets/issue-template.md](assets/issue-template.md). Local records need no
  separate authorization when repository changes are already approved.
- **Migrating:** when a tracker is authorized for outcomes that already have
  local records, move them into the tracker and delete the local files in the
  same change; do not keep both.
- **Response fallback:** when repository writes are not authorized or no
  workspace exists, return issue drafts without creating files.

## Process

1. Read the relevant plan, conversation, PR, findings, code, and existing issue
   records.
2. Keep work in the current change when it is required for correctness or the
   agreed outcome. Record only genuinely deferred work.
3. Split records by independently deliverable outcome. Keep related tasks
   together when separating them would lose necessary context.
4. Capture the reason, goal, observable completion criteria, and only the
   references needed to resume the work.
5. Link the originating plan, pull request, review, or issue when available.

When synchronizing a plan, keep the durable plan as the technical source of
truth. Create a concise tracker issue that explains the outcome and links the
plan. For a roadmap, create an umbrella issue and separate issues only for
independently executable milestones.

Do not invent requirements, labels, priorities, owners, or implementation
details unsupported by the source context. Do not add status or date ceremony
unless the repository already requires it.

## Report back

Report created local paths and external issue links. Distinguish local records
from published tracker items and state any item that could not be created.
