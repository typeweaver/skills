# Building a red loop

How to get one unattended red command per failure class. Consulted from step 1;
the skill body owns the procedure.

## A test that already fails

Narrow to one command: the runner's filter for a single file or test name, with
the quiet reporter. Run it once on an unmodified checkout to confirm it is red
for the user's symptom and not for a missing install or a stale build.

## A crash, error, or wrong output from a script or CLI

Write the smallest script that calls the entry point with the reported input and
exits non-zero on the symptom, asserting on the message, exit code, or returned
value. A shell script with `set -e` and a `grep` on the output is enough; the
test file comes later, in step 5.

## An intermittent failure

Run the candidate loop in a counted batch (`for i in $(seq 100)`) and record the
failure count. Below roughly one failure in twenty, bisection and single-run
observations are unreliable: raise the rate first by shortening timeouts,
running the batch in parallel, pinning a seed the runner exposes, shrinking a
delay, or constraining the scheduler to one worker or one CPU. Quote the pinned
rate with every later observation, and repeat enough runs that a change in the
rate is not noise.

## A regression since a known-good state

Find the last good commit, tag, or release, then let `git bisect run` drive the
loop. The loop must exit non-zero on the symptom and 125 when the commit cannot
build or install, so bisect skips those commits instead of blaming them.

## A performance regression

Make the loop assert a threshold instead of printing a number: measure the good
state first, then fail above it. Fix the input size, the warm-up count, and the
iteration count, and compare the median of repeated runs, not one run.

## A failure only visible through a browser or a real environment

Drive the repository's existing end-to-end runner headless with one spec and
tracing on. When the repository has no such runner, do not add one to debug:
capture the failing request and response, replay them against the server
directly, and build the loop there.

## Only a production report exists

Reconstruct the input from the log line, request, or payload and redact it.
Commit it as a fixture only once the loop is red. When the symptom needs data
you cannot obtain, that data is the artifact to ask for in step 1.

## The symptom depends on the environment

When it appears only on CI or another machine, pin what differs before
theorizing about the code: runtime version, locale, timezone (`TZ`), current
time, architecture, file system case sensitivity, and environment variables.
Set each explicitly inside the loop command so a later run cannot drift.
