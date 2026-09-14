---
name: create-pull-request
description: Open or update the pull request for a finished branch, with the
  title, description, and review comments it needs. Use when asked to open,
  create, or raise a pull request or PR, to update an existing one, or to put
  finished work up for review. Not for reviewing a diff, for handling review
  comments on an open pull request, or for committing work.
---

# Create Pull Request

Present one finished change so a reviewer can judge it from the pull request
alone. Write the title, description, and comments in English. Hand the pull
request back for a human to merge; never merge it yourself.

## Process

1. Read the complete diff against the target branch and the repository's
   instructions.
2. Confirm every hunk supports the one outcome the Summary will state. Report
   each hunk that does not — debug output, an unrelated edit, a comment
   narrating the change history — and ask whether to drop it or split it out.
   Do not amend or rewrite an existing commit to do so unless asked.
3. Run the check command CI runs or the verification commands the repository
   documents.
4. Before pushing, scan the diff and the description you wrote for
   credentials, tokens, private keys, `.env` contents, and internal hostnames
   the repository does not already publish. Stop and report what you found
   instead of pushing.
5. Push the branch, then update the pull request it already has; open one only
   when it has none. Post the comments below. Then ask once who should review,
   unless the user already named a reviewer, and request them through the
   platform's review-request mechanism.
6. Confirm the title, the description, and the diff you pushed agree, and that
   the review request registered.

Follow-up work you discover stays out of this pull request; list it in your
report. Create external issues only with explicit authorization for that
action.

## Title

`<type>(<scope>): <description>` in Conventional Commits format. For a
single-commit pull request the title is that commit's subject; for several,
write the subject covering them all, in the type and scope those commits use.

## Description

```markdown
### Summary

<why the change exists and the outcome it provides>

### Changes

- <behavior or decision changed, at the level a reviewer judges it; not a
  file-by-file narration>

### Validation

- <check you ran, with the result you saw; omit a check you did not run>

### Related

- <issue, plan, or specification; omit this section when empty>
```

## Comments

Post one comment for a decision where you chose between two workable
approaches and a reviewer could reasonably prefer the other: name the
decision, why you chose it, and what you want confirmed. Post one comment
naming the reading order when the diff spans more than one module and a
reviewer starting in the wrong one has to backtrack. If neither applies, post
nothing.
