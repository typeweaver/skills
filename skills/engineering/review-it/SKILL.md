---
name: review-it
description: Review a code change or pull request diff and report what breaks,
  backed by the lines that show it. Use when asked to review, check, or look
  over a diff, branch, commit, or pull request, or before a commit. Not for
  acting on review comments or for reviewing documents and plans.
---

# Review It

Find what the change breaks and what it makes the next change pay for, and
prove each from the diff. Put findings in the report only: do not edit, stage,
commit, push, or create issues.

Review from a context that did not author the change. If you authored or
orchestrated it, delegate by following
[references/review-handoff.md](references/review-handoff.md). As the delegated
reviewer, do not delegate again; treat the handoff as claims to check, not as
the verdict or the scope.

## Establish the review scope

1. Read the repository instructions, the goal, plan, or handoff when given,
   and the exact diff: base and head, staged changes, or a named file set.
   Leave unrelated working-tree changes out.
2. State the intended outcome from that evidence; mark what you inferred.
3. For every changed signature, export, schema, config key, or default, list
   its callers, consumers, and tests and check that each still holds. Read
   outside the diff only along a call, import, or data flow the diff touches.
4. For every parameter, option, field, or default the diff adds or changes,
   work out the result at its boundaries from the code: absent, empty, zero,
   negative, oversized. If you catch yourself taking its contract from the one
   test the diff ships, go back to the code.
5. Run the repository's read-only checks. Check a library call you cannot cite
   against the installed version's documentation.

Scope is set when you can name the diff you reviewed (refs, staged, or files),
every changed public name with its uses, the boundary results from step 4, and
the checks you ran.

## Find and classify

Read the diff for these tells; the tell sets the severity.

- **Blocking**, the change is wrong as written: a caller, consumer, or test
  still assumes the old signature, shape, error type, or default; an input you
  can name produces a wrong result; a failure path swallows the error or
  returns a value callers cannot tell from success; unchecked input from
  outside the trust boundary reaches a query, shell, path, or template; a
  secret in the diff; data already written is lost or misread. Name the input
  or call that fails.
- **Important**, a design, test, documentation, or maintainability problem
  introduced by the change whose cost lands on the next change to this code:
  a caller must know the implementation to call it; a test breaks on a
  behavior-preserving refactor because it asserts private state, call order,
  or call counts that are not the contract; new behavior has no test that
  fails without it in a repository that tests that layer; a README, doc
  comment, type, or changelog line is now false; a rule in the repository's
  instructions is broken.
- **Follow-up**, a defect or cost the change did not introduce, or new
  behavior the repository has no test layer for; do not ask for it to be
  fixed here.

Every finding names file and line and the failure or cost; Blocking and
Important quote the changed line. No line or no named failure: drop it. A
rename, reorder, or reformat with no failure named is a style note, also when
asked for as a separate formatting commit: drop it.

Honor required and forbidden perspectives from the user or the handoff. To
invoke one, call the Skill tool with the matching `ask-*` skill. A perspective adds findings to this
report; it does not change the severities or the template. Say in the report
when a required perspective is unavailable instead of substituting one.

Verdict: `Changes required` while a Blocking or Important finding remains,
`Review passed with follow-ups` when only Follow-ups remain, `Review passed`
when there are no findings.

## Report

```markdown
**Verdict:** <Review passed | Review passed with follow-ups | Changes required>

**Bottom line:** <most important conclusion>

### Review context

- **Outcome:** <what the change achieves>
- **Decisions:** <implementation decisions taken; mark inferred ones>
- **Review focus:** <where explicit reviewer feedback is valuable>
- **Expert perspectives:** <perspectives invoked or unavailable; omit when none>

### Findings

1. **[Blocking | Important] <finding>** — `<file:line>`
   - **Impact:** <the failure, with the quoted line>
   - **Recommendation:** <smallest change that removes the failure>

### Follow-ups

- **<topic>** — `<file:line>`, <the failure or cost outside the current change>

### Validation and confidence

- **Checked:** <evidence actually inspected or run>
- **Not verified:** <remaining evidence gaps>
```

Order findings by severity, then by how many callers the failure reaches. Omit
empty sections; with no findings, say so in the bottom line.
