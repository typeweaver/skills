---
name: retro-it
description: "Analyze a finished session: trace every correction to its cause
  and propose the exact instruction change."
disable-model-invocation: true
---

# Retro It

Every user correction has a cause in the instructions the agent was running.
The output of this retrospective is the exact text change that removes the
cause: the file, the line as it reads today, and the line that replaces it.
"Improve X" is not an output. The subject is the session, not the code it
produced. Read and propose only: do not edit files, stage, commit, push, or
create issues.

## Locate the session record

Discover what this harness exposes; do not assume a directory layout.

1. Probe the harness for a session store: a command that lists, resumes, or
   exports sessions, a configured transcript or log location, or an
   environment variable naming the current session.
2. Ask the user for the path when the session under review is not the one you
   are in and the probe found nothing.
3. Otherwise use the conversation you are in. It is a complete record for this
   skill; name the source you used instead of stopping.

Before quoting anything, scan it for credentials, tokens, private keys, `.env`
contents, and internal hostnames the repository does not already publish, and
name what the value identifies instead of pasting it.

Done when you can name the source you read and the first and last turn it
covers.

## Build the arc

In order, list what the user asked for and what the agent did, then mark:

- every turn where the user corrected, redirected, or repeated a requirement;
- every point where the agent asked instead of acting, or acted instead of
  asking;
- every detour: a subagent dispatched for work nothing used, a tool result
  large enough to push earlier context out, the same file read or the same
  command retried more than twice, an approach started and abandoned.

Done when every user turn is classified as the request, a correction, an
answer to the agent's question, or an acknowledgment, and every correction and
detour carries the quoted line that shows it.

## Name the cause

For each correction and each detour, name the skill, instruction file, or
harness setting that was active at that moment, then classify the cause:

- **Wrong assumption** — the agent inferred a convention the repository
  contradicts, and the repository states otherwise somewhere it could read.
- **Missing context** — nothing available to the agent carried the fact.
- **Rule did not fire** — a rule covers the case and the agent did not apply
  it. Quote the rule.
- **Rule fired and was wrong** — the agent applied a rule and the user
  corrected the result anyway. Quote the rule.
- **No-op rule** — the agent would have done the same with the rule deleted.

When no instruction covered the case, say so and classify it as missing
context.

Done when every correction and detour has a source named and one cause.

## Produce the change

Write each change so the user can paste it:

- **File** — the path it lands in. A skill's text, the repository's agent
  instructions, memory, or harness setup.
- **Current** — the line as it reads today, quoted from the file. For an
  addition, quote the line it goes after; for a no-op rule, quote the line to
  delete.
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
### <what the user corrected> — "<quoted turn>"

- **Active:** <skill, instruction file, or setting; or none>
- **Cause:** <wrong assumption | missing context | rule did not fire | rule
  fired and was wrong | no-op rule>
- **Change:** `<file>` — replace `<current>` with `<replacement>`
  (or: acknowledge, no change — <reason>)
```

When the session ran without corrections, say so and stop after the arc and
the detours. A stylistic preference, a question the agent asked and the user
answered, or a step the user accepted is not a correction; an empty findings
list is the correct result for a clean session.

Apply a change only when the user asks for it. When the user asks to keep the
findings as tracked work, call the Skill tool with `to-issues`.
