---
name: scaffold-it
description: Sketch the files, public contracts, and pending behavior tests of a
  settled change so its structure can be reviewed before implementation. Use
  when asked for a scaffold or when a plan adds or moves modules, public APIs,
  or dependencies. Not for deciding an open contract or implementing behavior.
---

# Scaffold It

Make the planned structure reviewable before implementing behavior. The diff
should show what each module owns, why that boundary fits the expected growth,
how modules depend on one another, and which observable cases the
implementation must cover.

Read the plan and the repository's conventions. Choose the final paths for
behavior owners and the public interfaces between them. Resolve details the
plan and code already settle; bring consequential open contract decisions to
the user before fixing their signatures.

Create only the files needed to review that structure. Give public functions,
types, and schemas real signatures and the contract documentation the
repository uses. Leave bodies clearly unimplemented in the repository's idiom.
Add pending tests for the contract's meaningful success and failure paths.
Leave private helpers and implementation details for implementation.

Wire exports and manifests as needed for the repository's checks, while keeping
stubs out of runtime paths. Mark temporary scaffold notes with `@scaffold` so
they can be removed during implementation.

Present a file tree with each file's responsibility and dependencies, the
pending cases as input or trigger to observable result, open decisions, and
check results. The reader should be able to approve or change the structure
from the report and diff. Stop before implementing behavior. Commit or open a
pull request only when asked.
