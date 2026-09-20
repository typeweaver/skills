# Review Handoff

How to delegate an independent review after authoring or orchestrating the
change, and the contract the reviewer receives.

## Delegating

1. Confirm the scope exists: the refs resolve and
   `git diff --stat <base>...<head>` is non-empty, `git diff --cached --stat`
   is non-empty for a staged review, or every path in the file set resolves to
   a file that exists. If the scope is empty, fix it; do not start a reviewer.
2. Fill in the contract below with facts you can point to. Link goals, plans,
   and check output by path. Leave out the implementation conversation, an
   expected verdict, and your defense of the change.
3. Start a subagent that inherits no conversation history (the `review-it`
   agent where installed), give it the repository path and the contract, and
   tell it to call the Skill tool with `review-it`. When that agent has no
   shell access, include the exact patch in the handoff instead of expecting it
   to resolve refs or staged changes itself.
4. When the harness offers no such subagent, review in the current context and
   write `Reviewed in author context` under Not verified. When repository
   instructions require an independent reviewer, report that none is available
   instead of reviewing.

## Contract

Every claim below is checked against the repository. Omit fields that do not
apply; state evidence gaps.

### Assignment

- **Repository:** <repository or worktree>
- **Change:** <exact base and head, staged changes, or a named file set>
- **Patch:** <exact patch; required when the reviewer has no shell access>
- **Excluded:** <unrelated working-tree changes>
- **Instructions:** <applicable repository guidance>

### Intent

- **Feature context:** <overall feature and why it exists>
- **Change outcome:** <what this specific slice should achieve>
- **Acceptance evidence:** <what proves this slice complete>
- **Goal and plan:** <paths or durable references>

### Decisions

- **Settled decisions:** <decision, rationale, and the tradeoff taken>
- **Plan deviations:** <deviations discovered during implementation>
- **Open uncertainty:** <remaining uncertainty without an expected verdict>

### Review focus

- **Requested feedback:** <specific questions or sensitive areas>
- **Expert lenses:** <required and forbidden, as the user stated them>

### Evidence

- **Checks run:** <actual commands or observations>
- **Results:** <verified outcomes>
- **Not verified:** <known evidence gaps>
