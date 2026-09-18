---
name: scaffold-it
description: Lay out the files, public signatures, and test cases of a planned
  change before any behavior is implemented, so a human can approve the
  structure from a file tree and the diff. Use when asked for a scaffold,
  skeleton, blueprint, or file structure, or when a plan adds or moves modules,
  public functions, or dependencies. Not for implementing behavior, and not for
  a plan whose contracts are still open.
---

# Scaffold It

Create the files of the planned change with their public signatures and no
behavior. From your report and the diff, a reader must see what each file
does, why it exists, and how it scales.

## Lay out

1. Create each file the plan names as an owner of behavior, at its final path.
   Leave out helpers, utilities, and private types: they are implementation
   decisions.
2. Write every public function, type, and schema with its real signature and
   the documentation form the repository uses (JSDoc, docstring, schema). Give
   each function body one statement that throws or returns not implemented, in
   the repository's idiom.
3. Start each file with a comment of at most three lines: what it owns, why it
   exists here, how it scales or where its limit is. Prefix every line that
   must disappear during implementation with `@scaffold`.
4. Write the test file of each owner with one pending case per path, in the
   framework's pending syntax (`test.todo`, `@pytest.mark.skip`, `t.Skip`),
   including every failure path the contract names. Name each case the way
   the repository names tests. A placeholder assertion that passes proves
   nothing.
5. Wire exports and manifests so the check command CI runs stays green. Do not
   call the new code from any runtime path.

If a signature needs a field, argument, result, or failure form the plan does
not settle, stop and list the open decisions instead of choosing one.

## Report

Post exactly these four parts and nothing else; the diff carries the rest.
[references/example.md](references/example.md) shows a complete scaffold and
its report.

1. `Scaffold for: <the outcome>` on the first line.
2. The file tree. One line per file: the path, then what it owns and what it
   imports. A test file shows its number of pending cases. A file that
   already existed is marked `changed:`.
3. `Tests`, then per test file one line per pending case as
   `<input or trigger> -> <observable result>`.
4. `Open decisions:` the list, or `none`. `Checks:` the command and its
   result.

Stop before implementation, commit, or pull request.
