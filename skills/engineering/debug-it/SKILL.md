---
name: debug-it
description: Find the cause of a defect by building a command that goes red on
  the reported symptom before forming any hypothesis, then land a regression
  test. Use when asked to debug or diagnose, when something is broken,
  throwing, failing, flaky, or slow since a change, or when a test fails and
  the user cannot explain why. Not for a lint or type error an existing check
  already reports, for implementing a fix that is already understood, or for
  restructuring code.
---

# Debug It

No hypothesis before a command exists that goes red on the reported symptom.
The loop is that command: one invocation, run unattended, red while the symptom
is present and green once it is gone. Everything below is mechanical once the
loop exists.

This skill diagnoses and fixes. It does not commit, push, or open anything.

## 1. Build the loop

Read [references/loops.md](references/loops.md) for how to get a red command
out of a crash, an intermittent failure, a regression since a known-good state,
a performance regression, a browser-only failure, or a production report.

Done when one command you have already run at least once:

- goes red on the user's exact symptom, not on a symptom nearby;
- is deterministic, or has a reproduction rate you measured and pinned
  ("red in 12 of 100 runs");
- runs in seconds;
- runs unattended: no manual step, no click, no waiting on you.

If you catch yourself reading code to form a theory before this command exists,
stop.

When no loop can be built, say so, list what you tried, and ask for the
artifact or environment access that would make one possible: a failing run's
log, a crash report, a database dump, a seed, a branch, access to the
environment where it fails. Do not hypothesize instead.

## 2. Reproduce and minimize

Cut input, configuration, fixtures, concurrency, and code paths out of the loop
while it stays red. Done when every remaining element is load-bearing: removing
any one turns the loop green. Keep the minimized loop; every observation after
this runs against it.

## 3. Hypothesize

Write three to five hypotheses, ranked by how much of the minimized loop they
explain. Each names a cause and the prediction that would disprove it: "if
state leaks through the module-level cache, clearing it between the two calls
turns the loop green." A claim no observation can contradict is not a
hypothesis; replace it. Show the ranked list to the user before you test any of
it.

## 4. Instrument

Change one variable per run and record what each run ruled out. Reach for a
debugger or a REPL before adding logs; it answers without editing the code
under test. Give every log you do add the same unique tag (`DBG-7f3a`), so
removing them later is one search.

Stop when one observation confirms a hypothesis and contradicts the others.
When every hypothesis is disproved, return to step 3 with what the runs ruled
out; do not widen the fix instead.

## 5. Fix

1. Write the regression test first, at a seam that exercises the real failure
   path: the call the user's symptom goes through, not a helper extracted to
   make the test easy. Confirm it fails for the cause you confirmed in step 4
   and not for a setup error.
2. When no seam exercises that path, that is the finding. Report it with the
   seam the code would need and ask whether to restructure first.
3. Make the test pass with the smallest change at the confirmed cause. A change
   that makes the symptom disappear without addressing that cause is a symptom
   patch: say so and name what it hides.

## 6. Clean up

Done when all of these hold:

- the loop from step 1 is green;
- the regression test passes, and fails again when you revert the fix;
- a search for the log tag finds nothing;
- scratch scripts, fixtures, seeds, and dumps you created are deleted, or kept
  deliberately and named in the report;
- the repository's own check command is green, not only the regression test;
- the confirmed hypothesis and the loop command are in the report, and in the
  commit message when the user asked for a commit.

## Report

State the symptom, the loop command, the minimized reproduction, the ranked
hypotheses with the observation that confirmed or disproved each, the fix with
its regression test, and what you did not resolve. Before showing a command,
its output, or a captured artifact, remove credentials, tokens, private keys,
`.env` contents, and internal hostnames the repository does not already
publish.

When the user has asked for a commit, call the Skill tool with
`conventional-commit`.
