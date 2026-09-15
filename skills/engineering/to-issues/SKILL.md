---
name: to-issues
description: Turn follow-up work, review findings, or plan items into issue
  records someone can pick up later. Use when asked to file, track, or write up
  follow-ups, to park work for later, to turn a plan or roadmap into issues, or
  to sync recorded work to a tracker. Not for doing the follow-up now, and not
  for leaving a TODO in the source.
---

# To Issues

Keep work that stays out of the current change as records someone can pick up
later. Record an item only when the current change is correct and meets the
agreed outcome without it; otherwise do the work now. A record is one issue:
a local Markdown file or a tracker issue.

## Choose the destination

Record each outcome in exactly one place.

- **External tracker when authorized:** create or update tracker issues only
  after explicit user authorization for that action; a tracker the user names
  in passing is not authorization to publish to it. Then create the issues
  there and nowhere else, and write a local record only where the repository
  documents a local mirror.
- **Local otherwise:** follow an existing repository convention; else write
  one Markdown file per record under `docs/issues/`. Local records need no
  separate authorization when repository changes are already approved.
- **Migrating:** when a tracker is authorized for outcomes that already have
  local records, move them into the tracker and delete the local files in the
  same change; do not keep both.
- **Response fallback:** when repository writes are not authorized or no
  workspace exists, return issue drafts without creating files.
- **Plans and roadmaps:** keep the durable plan as the technical source of
  truth and record one issue that states the outcome and links the plan. For a
  roadmap, record an umbrella issue plus one issue per milestone that ships on
  its own.

## Write the records

1. Read the plan, conversation, pull request, review, findings, and code the
   items come from, and the records that already exist. An outcome an existing
   record already covers is not a second record; add the new evidence to that
   record instead.
2. One record per outcome that could be delivered and closed on its own. If
   closing one record would leave another half-done, they are one record.
3. Write each record on [assets/issue-template.md](assets/issue-template.md)
   from the source context. A requirement, label, priority, owner, or
   implementation detail you cannot point to in that source context is invented:
   leave it out. Add a status or date field only where the repository already
   uses one.
4. Reference where a log, configuration, or finding lives instead of copying
   it into the record. No record carries credentials, tokens, private keys,
   `.env` contents, and internal hostnames the repository does not already
   publish; name what the value identifies instead of pasting it.

## Report back

Report created local paths and external issue links. Distinguish local records
from published tracker items and state any item that could not be created. When
the user named a tracker you were not authorized to publish to, say that nothing
was published there and offer to publish on their authorization.
