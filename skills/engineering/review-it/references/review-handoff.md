# Independent review handoff

Use this when you authored or orchestrated the change.

Confirm the review scope exists: the base and head resolve and their diff is
non-empty, staged changes exist, or every named file exists. Give a fresh
subagent with no implementation conversation the repository path and the
contract below. Use the `review-it` agent where installed and tell it to call
the Skill tool with `review-it`. Include the exact patch when the reviewer has
no shell access.

Give facts the reviewer can check. Leave out your defense of the change and an
expected verdict. If no fresh reviewer is available, review in the current
context and list `Reviewed in author context` under evidence gaps. If repository
instructions require independence, report that no reviewer is available.

## Contract

- **Repository and scope:** Repository path; exact base and head, staged diff,
  or named files; unrelated working-tree changes excluded.
- **Patch:** Exact patch if the reviewer cannot read the repository.
- **Instructions and intent:** Applicable repository instructions, feature
  context, this change's outcome, acceptance evidence, and paths to any goal
  or plan.
- **Decisions:** Settled decisions and trade-offs, plan deviations, and open
  uncertainty. Mark inferences.
- **Review focus:** Questions requiring judgment and requested Expert lenses.
- **Evidence:** Checks run and observed results; known gaps.

Omit fields that do not apply. The reviewer checks every claim against the
repository and reports remaining evidence gaps.
