# Independent review handoff

Use this when you authored or orchestrated the change.

Confirm the review scope exists before starting a reviewer: the base and head resolve and their diff is non-empty, staged changes exist, or every named file exists.
If the scope is empty, fix it first.

Give a fresh subagent without the implementation conversation the repository path and the contract below.
Use the `review-it` agent where installed and tell it to call the Skill tool with `review-it`.
Include the exact patch when the reviewer cannot read the repository.

Fill the contract with facts the reviewer can check.
Leave out your defense of the change and an expected verdict.
When no fresh reviewer is available, check whether repository instructions require independence.
If they do, report that no reviewer is available instead of reviewing.
Otherwise, review in the current context and write `Reviewed in author context` under Not verified.

## Contract

Omit fields that do not apply, except for the exact review scope and any evidence gaps.
The reviewer checks every claim against the repository.

```markdown
### Assignment

- **Repository:** <repository or worktree>
- **Change:** <exact base and head, staged changes, or named files>
- **Patch:** <exact patch; required when the reviewer cannot read the repository>
- **Excluded:** <unrelated working-tree changes>
- **Instructions:** <applicable repository guidance>

### Intent

- **Feature context:** <overall feature and why it exists>
- **Change outcome:** <what this specific slice should achieve>
- **Acceptance evidence:** <what proves this slice complete>
- **Goal and plan:** <paths or durable references>

### Decisions

- **Settled decisions:** <decision, rationale, and trade-off>
- **Plan deviations:** <deviations discovered during implementation>
- **Open uncertainty:** <remaining uncertainty without an expected verdict>

### Review focus

- **Requested feedback:** <specific questions or sensitive areas>
- **Expert lenses:** <requested lenses, if any>

### Evidence

- **Checks run:** <actual commands or observations>
- **Results:** <verified outcomes>
- **Not verified:** <known evidence gaps>
```
