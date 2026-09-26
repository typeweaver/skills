---
name: scaffold-it
description: Lay out a settled change's files, public signatures, and pending tests so a human can approve the structure before implementation. Use when asked for a scaffold, skeleton, blueprint, or file structure, or when a plan adds or moves modules, public functions, or dependencies. Not for settling open contracts or implementing behavior.
---

# Scaffold It

Your task is to make the planned structure visible before anyone implements it.
The file tree, report, and diff should let a human judge what each file owns, why it exists, and how it can grow.

## Lay out

Read the plan and the repository's conventions.
Create each planned owner of behavior at its final path.
Leave private helpers, utilities, and types for implementation.

Give every public function, type, and schema its real signature and the documentation form the repository uses.
Give a function body one statement that throws or returns not implemented in the repository's idiom.

Start each new file with a comment of at most three lines: what it owns, why it belongs here, and how it scales or where its limit lies.
Prefix each line that must disappear during implementation with `@scaffold`.

Write a test file for each owner with one pending case per path the contract names, including every failure path.
Use the framework's pending syntax, such as `test.todo`, `@pytest.mark.skip`, or `t.Skip`, and follow the repository's test names.
A passing placeholder assertion is not a pending test.

Wire exports and manifests so the check command CI runs stays green.
Do not call the new code from a runtime path.

If the plan and code do not settle a field, argument, result, or failure form in a public signature, stop and list every open decision.
Do not choose a contract for the user because one option looks convenient.

## Report

Post exactly these four parts; the diff carries the rest.
[This example](references/example.md) shows a complete scaffold and report.

```text
Scaffold for: <the outcome>

<file tree: one line per file with path, ownership, and imports; mark an existing file changed:; show each test file's pending-case count>

Tests
<test file>
- <input or trigger> -> <observable result>

Open decisions: <list or none>
Checks: <command and result>
```

Stop there and wait for the human to approve or change the structure.
Do not implement behavior, commit, or open a pull request as part of scaffolding.
