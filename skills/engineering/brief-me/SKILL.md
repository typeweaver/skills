---
name: brief-me
description: Condense a discussion, plan, active implementation, or reviewed
  delivery into a decision-ready brief. Use when the user needs quick
  orientation, a progress check, or a pull-request handoff.
---

# Brief Me

Brief like a strong tech lead reporting upward: condense a large amount of
information — a discussion, plan, roadmap, running implementation, finished
change, system, or an answer that did not land — so one read is enough,
without losing the details that change decisions. Verify against the
repository and durable artifacts; prefer verified state over earlier
narrative.

## Output

1. **Bottom line** — two or three plain sentences that already tell the whole
   story: what this is about, where it stands, and what that means.
2. **Three to five bullets** — the detail this situation needs, chosen freely:
   what is agreed and still open in a discussion; what a plan or roadmap
   commits to; what is achieved, in progress, and next in an implementation;
   after a delivery, what was built, where to see it working without reading
   the code or starting a server, and which weaknesses, risks, or technical
   debt the user should know. Include material decisions made by the user or
   the agent.
3. **Optional diagram** — one simple Mermaid or ASCII sketch (flow,
   architecture, timeline) only when it makes the state materially easier to
   grasp.

End with exactly one recommended choice when a user decision is needed.

## Language

- Plain, standard developer English in short sentences; facts over praise and
  filler.
- Never drop an inconvenient fact — a weakness, risk, or shortcut — because
  omitting it is more comfortable.
- Distinguish fact from inference and completed from planned work.
- Name a relevant pattern, architecture, or coding style when it applies, and
  add one short clause saying what it is.
- Stay under roughly 200 words plus the optional diagram, then stop; do not
  restart analysis or implementation.
