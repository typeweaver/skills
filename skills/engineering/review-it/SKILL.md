---
name: review-it
description: Review a code change or pull request for concrete failures and costly design decisions, backed by the diff.
  Use for a diff, branch, commit, pull request, or pre-commit review.
  Not for acting on review feedback or reviewing documents and plans.
---

# Review It

Find what the change breaks and what it makes the next change pay for.
Prove each finding from the diff and put it in the report.
Do not edit, stage, commit, push, or create issues during the review.

Review from a context that did not author the change.
If you authored or orchestrated it, arrange a fresh reviewer using [the review handoff](references/review-handoff.md).
As the delegated reviewer, check the handoff's claims against the repository and do not delegate again.

## Inspect

Read the repository instructions, the goal, plan, or handoff when given, and the exact diff:
base and head, staged changes, or named files.
Leave unrelated working-tree changes out.
State the intended outcome from that evidence and mark any inference.

For every changed signature, export, schema, config key, or default, trace its callers, consumers, and tests.
Follow a call or data flow outside the diff when it bears on the change.
For changed inputs, work through absent, empty, zero, negative, and oversized values where they apply.
Derive their contract from the code, not only from the tests in the diff.

Run the repository's relevant read-only checks.
Verify unfamiliar library behavior against the installed version's documentation.
The scope is established when you can name the reviewed refs or files,
every changed public name with its uses, the applicable boundary results, and the checks you ran.

## Judge

- **Blocking:** A named input or caller fails, existing data is lost or misread,
  or an error becomes indistinguishable from success.
  A secret is exposed, or unchecked input crosses a trust boundary into a query, shell, path, or template.
  Name the failing path.
- **Important:** The change introduces a cost the next change must carry.
  Callers need implementation knowledge,
  or tests break on a behavior-preserving refactor because they assert private state, call order, or call counts.
  New behavior has no test that fails without it in a layer the repository tests,
  documentation or types become false, or a repository instruction is broken.
  Name the concrete cost.
- **Follow-up:** A defect or cost predating the change, or new behavior where the repository has no test layer.
  Keep it outside the requested change.

Drop a claim without both a file line and a concrete failure or cost.
For Blocking and Important findings, quote the changed line.
Drop pure rename, reorder, and formatting notes when they have no failure,
even if someone requested a separate formatting commit.

Apply Expert lenses requested by the user or handoff.
They may add findings without changing the severities or the report format.
Report a requested lens you could not access.

## Report

Use this form so the author and the next review step can act on the same evidence:

```markdown
**Verdict:** <Review passed | Review passed with follow-ups | Changes required>

**Bottom line:** <most important conclusion>

### Review context

- **Outcome:** <what the change achieves>
- **Decisions:** <implementation decisions taken; mark inferred ones>
- **Review focus:** <where explicit reviewer feedback is valuable>
- **Expert lenses:** <lenses invoked or unavailable; omit when none>

### Findings

1. **[Blocking | Important] <finding>** — `<file:line>`
   - **Impact:** <the failure or cost, with the quoted changed line>
   - **Recommendation:** <smallest change that removes it>

### Follow-ups

- **<topic>** — `<file:line>`, <the failure or cost outside the current change>

### Validation and confidence

- **Checked:** <evidence actually inspected or run>
- **Not verified:** <remaining evidence gaps>
```

Choose **Changes required** while a Blocking or Important finding remains,
**Review passed with follow-ups** when only Follow-ups remain,
and **Review passed** when there are no findings.
Order findings by severity, then by how many callers they reach.
Omit empty sections and say explicitly when there are no findings.
