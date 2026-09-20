---
name: retro-it
description: Analyze a completed agent session and turn each user correction or
  detour into an exact instruction change. Use when improving agent skills,
  repository instructions, memory, or harness settings from a session that went
  wrong or needed repeated redirection. Not for reviewing the code produced by
  the session or for a team process retrospective.
---

# Retro It

Every user correction has a cause: the instructions the agent was running, or a
requirement that changed. The output of this retrospective is the exact text
change that removes the cause: the file, the line as it reads today, and the
line that replaces it. The subject is the session, not the code it produced.
Read and propose; do not edit files, create issue records, stage, commit, or
push. When an orchestrator invoked this skill to deliver instruction
improvements, return the report to it as the implementation source; the
orchestrator owns editing, review, commits, and delivery. Otherwise hand the
report back and stop.

## Locate the session record

Use a harness session store if a command, config, or env var names one. If the
session is not this conversation and nothing turned up, ask for the path. If
the store is unreadable, use the work it left — commits, pull requests, issues,
review comments — and say which later steps that record cannot satisfy.
Otherwise use this conversation. Name the source; do not stop for lack of a
transcript.

Before quoting, scan for credentials, tokens, private keys, `.env` contents,
and internal hostnames the repository does not already publish; name what the
value identifies instead of pasting it.

Done when you can name the source and its bounds: first and last turn, or first
and last artifact.

## Build the arc

In order, list what the user asked for and what the agent did, then mark:

- every turn where the user corrected, redirected, or repeated a requirement;
- every point where the agent asked instead of acting, or acted instead of
  asking;
- every detour: a subagent dispatched for work nothing used, a tool result
  large enough to push earlier context out, the same file read or the same
  command retried more than twice, an approach started and abandoned.

Done when every user turn is classified as the request, a correction, an answer
to the agent's question, or an acknowledgment, and every correction and detour
carries the quoted line that shows it. Without a transcript, classify every
recorded correction instead of every user turn, and quote the artifact that
records it. Say that you did.

## Name the cause

For each correction and each detour, name the skill, instruction file, or
harness setting that was active at that moment, or state that none was, then
classify the cause:

- **Wrong assumption** — the agent inferred a convention the repository
  contradicts somewhere it could read.
- **Missing context** — nothing available to the agent carried the fact. If you
  catch yourself writing "missing context" without having opened the
  repository's instruction files and the skill that was active, open them
  first.
- **Rule did not fire** — a rule covers the case and the agent did not apply
  it. Quote the rule.
- **Rule fired and was wrong** — the agent applied a rule and the user
  corrected the result anyway. Quote the rule.
- **Check passed and the defect shipped** — an automated check covered the
  case, reported success, and the defect reached the branch anyway. Quote the
  check.
- **No-op rule** — the agent would have done the same with the rule deleted.

Done when every correction and detour names its active source or states that
none was active, and carries one cause.

## Produce the change

Write each change so the user can paste it:

- **File** — the path it lands in: a skill, the repository's agent
  instructions, memory, or harness setup.
- **Current** — the line as it reads today, quoted from the file. For an
  addition, quote the line it goes after; for a no-op rule, the line to delete.
- **Replacement** — the exact new text.

When the instruction is already right and the correction will not recur, write
"acknowledge, no change" and the reason.

A change that names a file but no current text or no replacement is not done.
Neither is a replacement that repeats the cause back as a goal: "be careful
about X", "improve X", "clarify X". If you catch yourself writing one, open
the file and write the sentence you would paste.

Done when every cause has a change or an acknowledgment.

## Report

Open with the arc in a few lines, then one entry per correction and detour:

```markdown
### <what was corrected> — "<quoted turn or artifact>"

- **Active:** <skill, instruction file, or setting; or none>
- **Cause:** <wrong assumption | missing context | rule did not fire | rule
  fired and was wrong | check passed and the defect shipped | no-op rule>
- **Change:** `<file>` — replace `<current>` with `<replacement>`
  (or: acknowledge, no change — <reason>)
```

Put the current text and the replacement in fenced blocks under the entry when
either spans more than one line. Close with the decisions that are not yours to
take — a policy change, an edit to a ticket someone else owns, a choice between
two defensible fixes — each naming its finding and the option you recommend.

A stylistic preference, a question the agent asked and the user answered, or a
step the user accepted is not a correction. When there were none, say so and
stop after the arc and the detours; an empty findings list is correct.
