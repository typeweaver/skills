---
name: create-pull-request
description: Create or update a focused, reviewable pull request from completed
  work. Use when an implementation is ready to be presented for review.
---

# Create Pull Request

Present one coherent change with enough context to review it efficiently.

Write all pull request content in English, including the title, description,
comments, and review guidance. Never merge the pull request.

## Process

1. Inspect the complete diff against the target branch and applicable
   repository instructions.
2. Confirm one coherent purpose. Remove unrelated work, debug artifacts,
   temporary changes, and comments that justify change history.
3. Run relevant checks and report only validation that actually passed.
4. Push when necessary, then create or update the branch's existing pull
   request—never create a duplicate.
5. Verify that the final title, description, diff, and validation agree.
6. Return to the active workflow for independent review, delivery, or feedback
   handling.

## Review requests

Honor reviewer selection deferred by an active workflow. Otherwise ask one
concise question after creating or updating the pull request unless the user
already named a reviewer. Use and verify the platform's formal review-request
mechanism.

## Pull request title

Use the Conventional Commits format:

`<type>(<scope>): <description>`

Omit `(<scope>)` when no meaningful scope exists.

Choose type and scope from the actual changes.

## Pull request description

Use this concise structure:

```markdown
### Summary
<why the change exists and the outcome it provides>

### Changes
- <important change at a useful review level>

### Validation
- <check or observation that actually passed>

### Related
- <issue, plan, or specification; omit this section when empty>
```

Summarize behavior and decisions; do not narrate every file.

## Review focus

When a material decision deserves explicit feedback, post a separate comment
with:

- the decision,
- why that approach was chosen,
- what feedback or confirmation is requested.

Do not manufacture questions. For a structurally complex PR, a separate comment
may also suggest a review order and the important entry points; omit it for a
straightforward diff.

If meaningful follow-up work is discovered, keep its implementation outside
the pull request and return enough context for the active workflow to preserve
it locally. Publish it externally only after explicit authorization.
