---
name: create-pull-request
description: Open or update a pull request for a finished branch.
  Use when asked to put completed work up for review.
  Not for reviewing a diff, addressing review comments, or committing work.
---

# Create Pull Request

Your task is to present one finished change so a reviewer can judge it from the pull request alone.
Write the title, description, and comments in English.
Hand the pull request back for a human to merge.
Do not merge it yourself.

## Before publication

Read the complete diff against the target branch and the repository's instructions.
Every hunk should support the one outcome the PR will state.
If you find debug output, an unrelated edit, or a comment narrating change history,
report it and ask whether to drop or separate it.
Do not amend or rewrite an existing commit unless asked.

Run the checks CI runs or the verification commands the repository documents.
Report the results you saw, including failures.

Before pushing, scan the diff and the title, description, and comments you will publish
for credentials, tokens, private keys, `.env` contents, and internal hostnames the repository does not already publish.
If you find any, stop and report them instead of pushing.

## Publication

Use a Conventional Commits title: `<type>(<scope>): <description>`.
For one commit, use its subject.
For several, write the subject that covers them all, using the type and scope those commits support.

Once authorized to publish, push the branch and update its existing pull request, or open one if none exists.
Post only comments the pull request does not already carry.
Request the reviewer the user named through the platform's review-request mechanism.
If none was named and the pull request has no reviewer,
ask once who should review, unless an orchestrating workflow defers the choice.

Check that the published title, description, and diff agree and that any review request registered.
Report the pull request link and follow-up work you found.
Keep that follow-up work out of this pull request, and create external issues only when authorized to do so.

## Description

Use this form so the reviewer can find the outcome, the change, and the evidence
without reconstructing the conversation:

```markdown
### Summary

<why the change exists and the outcome it provides>

### Changes

- <behavior or decision changed, at the level a reviewer judges it; not a
  file-by-file narration>

### Validation

- <check you ran, with the result you saw; omit a check you did not run and
  do not report a failed check as passed>

### Related

- <issue, plan, or specification; omit this section when empty>
```

Keep the whole description under about 150 words.
Analysis, rejected alternatives, and the reasoning behind each finding
belong in the diff, a plan file, or a comment a reviewer asked for.

## Comments

Post one comment when the diff contains a decision a reviewer could reasonably have made another way:
name the decision, why you chose it, and what you want confirmed.
Post one comment naming the reading order when starting in the wrong file would make a reviewer backtrack.
If neither applies, post nothing.
