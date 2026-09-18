# equip-it

## 0.1.2

### Patch Changes

- 4cfbb42: Give every `ask-*` persona at least three observable tells so the lens names a symptom in the material instead of restating its principles.
- 275840c: Give every `ask-*` skill a testable invocation rule in its description, keep the
  opening-sentence criterion conditional on the agent selecting the lens itself,
  and delete the template's no-op voice lines, restated principles, and duplicated
  sources footers.
- 2a00d28: Sharpen the aurelius skill: decision rules instead of evaluative gates, and no design rules owned by craft-it or the ask-* skills.
- ef486d3: `brief-me` now starts from the reader's context, offers a re-pitch when an
  explanation did not land, picks the smallest view that makes the state clear,
  and carries tells for filler and for a dropped inconvenient fact, a rule to
  reference plans, issues, commits, and diffs by path, and a redaction rule. The
  per-item bounds carry the length contract on their own, so the global word
  number is gone and the stop after the view stays.
- f9244c1: Revise `challenge-me`: define consequential once as the only stopping test (the frontier is empty), give weak answers their tell, put an unnamed risk on the frontier when it is consequential, and describe the skill in the user's words, with a trigger that no longer overlaps `aurelius`.
- efbb0a9: Print expected outcomes such as conflicts, missing receipts, and adapter drift
  as plain messages without a stack trace, accept `--yes` on `update` and
  `uninstall` for consistency, and ship a minified bundle.
- 12e9159: Revise `conventional-commit`: give the split and breaking-change rules their tests, turn the secrets prohibition into a pre-stage check that withholds the file, bound the scope lookup to the last 20 log subjects, read the commit back after making it, and loop the process until every change is committed or reported as withheld.
- 12223e3: Give `craft-it` the comment rules that decide at implementation time: keep a comment only when deleting it loses information the code cannot express, prefer a rename, type, or test over a comment, and put suppressions on the triggering line with the rule and its removal condition.
- 5071652: Revise `craft-it`: replace generic design bullets with observable tells, use one term for the agreed outcome, report pre-existing defects as follow-ups instead of fixing them unasked, and route an unexplained defect to `debug-it` and a standalone document to `document-it`.
- a8a139b: Revise `create-pull-request`: give the review-focus and reading-order comments their conditions, add a pre-push secrets check with stop-and-report, keep the reviewer deferral an orchestrating workflow relies on, guard the comments and the reviewer question on an update, and drop the workflow routing.
- 14a5b89: Add the `debug-it` skill: diagnose a defect by building a command that goes red
  on the reported symptom before any hypothesis, then land a regression test.
- 9483ef6: Revise `define-goal`: make the ask-or-infer decision a two-readings test, state the blocked condition once as goal content in the shared wording, define the source once, and give the outcome, evidence, and invention rules their tells.
- 958431c: Add the `document-it` skill: write or rewrite a standalone document that names
  its reader, keeps one document type, answers the reader's listed questions
  answer-first, passes a fresh-reader test, and carries the shared redaction rule.
- 63beedb: Route `drive-it` through the Skill tool and replace its evaluative wording with
  the severity, perspective, and blocked rules the skills it calls already define.
  Split the interrupt duty from the blocked precondition so the rule is no longer
  circular, and name an output for every phase the resume rule covers.
  Add the optional Scaffold step: when a milestone adds or moves modules, public
  functions, or dependencies, `scaffold-it` lays out the structure for one
  approval before `craft-it` builds on it.
- 72c646e: Add `guard-it`, a setup skill that wires strict compiler, type-aware lint, dead-code, boundary, and supply-chain checks into CI.
- c26f474: Rewrite `nextjs-feature-architecture` as a six-step procedure with one
  reference file per step, replace its adjective-gated rules with observable
  conditions, and give each concept a single name and a single source of truth.
- 9ee40af: Revise `nextjs-feature-architecture`: shallow-routing and mutation-transport rules, sharper cookie and static-shell guidance, a review output contract, and a shorter body.
- 856df6e: Revise `plan-it`: a tell for workflow steps, decisions recorded where alternatives existed, a runnable `Done when` check ending every step, tracer-bullet milestones, and the redaction rule in the wording the other skills share.
- d94adaf: Revise `pr-review-loop`: define blocked once in the shared wording, give the
  Agree/Unsure/Disagree branches and the merge-ready checklist their tests,
  discover the branch-update convention instead of hard-coding merge, and add a
  redaction gate for what the loop publishes. Reconcile the two stop conditions
  so the harness handback is an explicit terminal state, say what one pass over a
  red required check does, route the Agree path through `conventional-commit`,
  and name the object the branch update merges in.
- eda683b: Add `retro-it`, a user-invoked skill that traces every correction in a finished
  session to its cause and proposes the exact instruction change.
- d95f89f: Revise `review-it`: severities defined by diff-visible tells, findings that quote the changed line and name the failure, perspectives invoked through their `ask-*` skills, and delegation moved to the handoff reference.
- 045c0e9: Add `scaffold-it`: lay out the files, public signatures, and pending test cases of a planned change and report them as a tree for structure approval before implementation. `craft-it` starts from existing `@scaffold` files.
- 1e9c5af: `to-issues` records each outcome in exactly one place: the authorized tracker,
  or local files when no tracker is authorized, never both. An outcome an existing
  record already covers is not a second record. It also records an item only when
  the current change is correct without it, splits records by the outcome that
  could be closed on its own, writes a local mirror only where the repository
  documents one, and keeps secrets out of a record. Publishing to a tracker needs
  explicit authorization for that action, and the report says when nothing was
  published. The description, the catalog one-liners, and the packaged prompt now
  name that single destination.

## 0.1.1

### Patch Changes

- d1957a5: Ship the CLI as a single bundled file with no runtime dependencies, so
  `npx equip-it` no longer depends on how the consumer's package manager
  resolves the effect packages.
- 658a04d: Fix the crash on startup when installed with npm or npx. The exact `effect`
  pin conflicted with the peer ranges of `@effect/platform-node`'s transitive
  packages, so npm nested a second `effect` copy and the two runtimes could not
  share scopes. The effect packages now use compatible ranges, and the package
  smoke test installs with npm and asserts a single `effect` copy.

## 0.1.0

### Minor Changes

- c644a54: Add `comment-it`, a compact source-comment skill that preserves durable
  rationale and contracts while removing narration, change history, and stale
  commentary.
- cc1ce2a: Initial release: guided installer for Typeweaver Skills. Detects Claude Code,
  Codex, OpenCode, and Kiro, installs bundled skills and agents with
  transactional conflict-safe semantics, and supports `install`, `update`,
  `doctor`, `uninstall`, and `generate` — interactively for humans and
  flag-driven for automation. Exact existing content is adopted; replacing or
  removing conflicting selected components requires explicit `--force`.

### Patch Changes

- db408ea: Keep the Next.js feature architecture an ownership model with evolutionary
  growth, explicit feature and domain dependency direction, correct Cache
  Components invalidation and refresh semantics, and optional scenarios that
  start from a composition root.
