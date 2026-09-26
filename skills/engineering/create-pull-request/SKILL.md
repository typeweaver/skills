---
name: create-pull-request
description: Open or update a pull request for a finished branch. Use when the
  user asks to put completed work up for review. Not for reviewing a diff,
  addressing PR feedback, or committing work.
---

# Create Pull Request

Present one finished change so a reviewer can judge it from the pull request
and diff. Write the title, description, and comments in English. Leave the
merge to a human.

Read the full diff against the target branch and the repository's instructions.
Keep every hunk relevant to the PR's outcome. Surface unrelated changes for a
decision on removal or separation; do not rewrite existing commits without a
request. Run the repository's documented or CI checks and report the results
you actually saw.

Before pushing, scan the diff and everything you will publish for credentials,
tokens, private keys, `.env` contents, and unpublished internal hostnames. If
you find any, stop and report them instead of pushing.

Use a Conventional Commits title. For a single commit, use its subject; for
several commits, summarize their shared outcome with the appropriate type and
scope. Keep the description short: explain why the change exists, what a
reviewer should inspect, the checks and results, and any relevant issue or
plan. Describe behavior and decisions rather than narrating files. Mention
failed or unrun checks plainly.

Once authorized to publish, push the branch and update its existing PR, or
open one if none exists. Add a comment only when it helps a reviewer understand
a non-obvious decision or reading order. Avoid duplicate comments. Request a
named reviewer through the platform's review mechanism. If none was named and
the PR has no reviewer, ask once who should review, unless the orchestrating
workflow has deferred that choice.

Check the published title, description, diff, and review request against what
you intended. Hand back the PR link and any follow-up work you found. Create
external issues only when that action is authorized.
