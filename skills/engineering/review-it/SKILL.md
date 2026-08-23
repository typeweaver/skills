---
name: review-it
description: Independently review a completed code change or pull request and
  return prioritized, evidence-backed findings. Use before commit, after pull
  request updates, or when the user requests code review; stay read-only.
---

# Review It

Provide an independent, evidence-backed review of the complete intended change.
Stay read-only: do not edit, stage, commit, push, or create issues. Expert
perspectives may sharpen judgment but never replace this scope, severity model,
or output.

## Preserve independence

When coordinating a review after authoring or orchestrating the change:

1. Read and complete
   [references/review-handoff.md](references/review-handoff.md).
2. Start a fresh subagent without inherited conversation context when possible.
3. Pass the handoff and repository access, and activate `review-it` there.

When already acting as that fresh reviewer, do not delegate again. Treat the
handoff as challengeable context, never as an expected verdict or scope limit.

Apply user-required perspectives, exclude forbidden ones, and select at most one
additional perspective only when its distinct lens materially improves the
review. Disclose unavailable required perspectives; never silently substitute.

If no fresh reviewer is available, perform the strongest local fallback, label
it non-independent, and reduce confidence. Report a blocker only when applicable
instructions require independence.

## Establish the review scope

1. Inspect repository instructions, Git state, the plan or goal, and the exact
   candidate diff.
2. Isolate the intended commit from unrelated work. Consider unrelated code
   only when its interaction with the change matters.
3. Reconstruct the outcome, decisions, and requested focus from evidence. Label
   inference and never invent rationale.
4. Inspect relevant callers, consumers, tests, public interfaces, dependency
   declarations, and documentation; run useful read-only checks.
5. Verify unfamiliar or version-sensitive library use against the installed
   version and primary documentation.

## Review lenses

- **Behavior and safety:** Find correctness defects, missed edge cases, broken
  contracts, unsafe failure behavior, data risks, concurrency issues, and
  regressions.
- **Security and dependencies:** Examine trust boundaries, authorization,
  validation, privacy, secrets, supply-chain risk, dependency necessity, and
  supported library patterns.
- **Architecture and repository fit:** Evaluate ownership, dependency direction,
  cohesion, coupling, cycles, module boundaries, shared semantics, change
  amplification, and repository conventions. Accept deliberate improvements;
  classify broader convergence as Follow-up work.
- **Interfaces, documentation, and comments:** Prefer small, stable public
  interfaces that hide implementation details. Require consumer-facing
  contracts and comments only for durable, non-obvious rationale or constraints.
- **Testability and tests:** Prefer a functional core with an imperative shell:
  pure transformations, explicit effect boundaries, and small fakes. Accept
  mocks or spies only when interaction is the contract. Judge regression value,
  refactoring resistance, speed, and maintainability.
- **Growth and operability:** Check whether the design supports the next
  plausible change or scale step and exposes relevant failure modes without
  speculative architecture.

Assess every lens, but report only evidence-backed findings with a credible
failure or maintenance consequence—never style nits or checklist narration.

## Classify findings

- **Blocking:** A correctness, security, data-loss, or contract problem that
  makes the candidate unsafe to advance.
- **Important:** A material design, test, documentation, or maintainability
  problem introduced by the change that must be fixed before it advances.
- **Follow-up:** A valid broader, pre-existing, or future-facing improvement
  that does not need to expand the current change.

Use `Changes required` when any Blocking or Important finding remains,
`Review passed with follow-ups` when only Follow-ups remain, and `Review passed`
when no material finding remains.

## Report

```markdown
**Verdict:** <Review passed | Review passed with follow-ups | Changes required>

**Bottom line:** <most important conclusion>

### Review context

- **Outcome:** <what the change achieves>
- **Decisions:** <material implementation decisions>
- **Review focus:** <where explicit reviewer feedback is valuable>
- **Expert perspectives:** <used perspectives and why; omit when unused>

### Findings

1. **[Blocking | Important] <finding>** — `<file:line>`
   - **Impact:** <concrete consequence>
   - **Recommendation:** <smallest sound improvement>

### Follow-ups

- **<topic>** — <why it matters outside the current change>

### Validation and confidence

- **Checked:** <evidence actually inspected or run>
- **Not verified:** <remaining evidence gaps>
```

Order findings by impact. Omit empty sections, but state when no material
findings remain.
