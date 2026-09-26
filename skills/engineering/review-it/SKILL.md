---
name: review-it
description: Review a code change or pull request for concrete failures and
  costly design decisions, backed by the diff. Use for a diff, branch, commit,
  pull request, or pre-commit review. Not for acting on review feedback or
  reviewing documents and plans.
---

# Review It

Find what the change breaks and what it makes the next change pay for.
Report findings with evidence from the diff. Keep the review read-only:
do not edit, stage, commit, push, or create issues.

If you authored or orchestrated the change, arrange a fresh reviewer using
[the review handoff](references/review-handoff.md). A delegated reviewer reviews
directly and checks the handoff's claims against the repository.

## Inspect

Establish the exact diff and intended outcome from the repository instructions,
goal, plan, and handoff where available. Mark inferred intent as an inference.
Leave unrelated working-tree changes outside the review.

Trace changed signatures, exports, schemas, config keys, and defaults to their
callers, consumers, and tests. For changed inputs, work through absent, empty,
zero, negative, and oversized values where they apply. Derive the contract from
the code, not only from tests in the diff. Follow the call and data flow beyond
the diff when needed to establish an impact.

Run relevant read-only checks. Verify unfamiliar library behavior against the
installed version's documentation. Before concluding, be able to name the
reviewed refs or files, the affected uses, the applicable boundary results,
and what the checks established.

## Judge

- **Blocking:** The change fails for a named input or caller, loses or misreads
  data, exposes a secret, lets untrusted input reach a dangerous sink, or makes
  an error indistinguishable from success. Name the failing path.
- **Important:** The change introduces a cost the next change must carry:
  callers need implementation knowledge; tests assert private details; or new
  behavior has no test that fails without it in a layer the repository tests.
  False documentation or types, and broken repository instructions, also count.
  Name the concrete cost.
- **Follow-up:** A defect or cost predating the change, or new behavior where
  the repository has no test layer. Keep it outside the requested change.

For every finding, give a file and line plus the failure or cost. Quote the
changed line for Blocking and Important findings. Drop claims without a
specific failure or cost, including pure rename, reorder, and formatting notes.

Apply requested Expert lenses without changing these categories. Report any
requested lens you could not access.

## Report

Lead with one verdict: **Changes required** if Blocking or Important findings
remain; **Review passed with follow-ups** if only Follow-ups remain; otherwise
**Review passed**. Give the most consequential conclusion next.

For each Blocking or Important finding, state severity, file and line, impact
with the changed line, and the smallest correction. Order by severity, then
reach across callers. Put Follow-ups separately. Include the intended outcome,
review focus, decisions worth reviewing, requested Expert lenses, checks
performed, and evidence gaps. Omit empty sections. When there are no findings,
say so explicitly.
