---
name: craft-it
description: Implement or refactor code once the intended outcome is clear. Use
  for production changes that must fit the repository, remain maintainable, and
  be ready for independent review.
---

# Craft It

Build the smallest complete solution so the touched code is understandable from
the repository alone. Treat actual public interfaces as package-quality
contracts without imposing speculative stability on private code. Leave a
coherent, verified candidate; do not plan, review, commit, or deliver it here.

## Establish the change

1. Inspect repository instructions, the active goal, architecture, neighboring
   code, public surfaces, tests, and validation commands.
2. Identify existing contracts and the smallest coherent change that satisfies
   the outcome.
3. Follow sound repository patterns. Keep deliberate improvements internally
   consistent and leave broader convergence outside the change.
4. Decide implementation details and perform necessary research independently.
   Pause only when new evidence invalidates the approved outcome or scope,
   requires unavailable authority, or creates serious irreversible risk.

## Build code that can grow

- Give each module clear ownership of related data, state, and behavior. Keep
  cohesion high and coupling low, explicit, and directed.
- Avoid cycles, hidden shared state, and contracts that expose private or
  third-party representations.
- Share a component only when consumers truly share semantics and lifecycle.
  Prefer composition over premature reuse or a broad common layer.
- Prefer a functional core with an imperative shell: pure transformations for
  domain logic, explicit dependencies, and narrow effectful boundaries.
- Keep public interfaces small, stable, and consumer-oriented. Export only what
  callers need and document public contracts to package-quality standards.
- Minimize change amplification. Let each function tell one coherent story and
  extract concepts, not arbitrary fragments.
- Handle errors, edge cases, and operational failure deliberately. Build the
  smallest complete solution without speculative abstractions.

## Write durable documentation

- Prefer expressive names, types, structure, and tests over narrated code.
- Document public behavior, inputs, outputs, errors, side effects, invariants,
  and non-obvious usage with the repository's established documentation form.
- Use inline comments only for durable rationale, constraints, invariants,
  surprising dependency behavior, or non-obvious coupling.
- Write for the code at HEAD: never address a reviewer or refer to a
  conversation, diff, temporary plan, or plan step. Link an issue only when it
  is the durable source of an external constraint and the repository expects it.
- Remove stale or redundant documentation; a false explanation is worse than
  none.

## Test contracts, not implementation

- Cover observable behavior, important boundaries, failure modes, and
  regressions introduced or exposed by the change.
- Test pure transformations directly. At effectful boundaries, prefer small
  fakes, in-memory implementations, or injected ports.
- Use mocks or spies only when the interaction itself is the contract or the
  boundary cannot be controlled directly. Assert behavior, not incidental call
  counts. Keep tests deterministic and resilient to sound refactoring.

## Own the touched codebase

Fix a pre-existing defect without asking when it is understood, bounded,
low-risk, testable, and does not change the approved outcome. Keep it separate
when combining it would obscure either change. Leave broad, risky, or independent
work outside the candidate and preserve enough context to resume it. Do not
publish external work items without authorization.

## Finish the candidate

1. Run relevant focused and repository-wide checks.
2. Inspect the complete diff for accidental scope, debug artifacts, stale
   documentation, and repository inconsistencies.
3. Preserve material decisions, deviations, evidence, and refactoring pressure
   in an existing handoff; otherwise report them without creating a new artifact.
4. Report the outcome, important decisions, validation, nearby defects fixed,
   and follow-ups.

The candidate is ready when it fulfills the agreed outcome, fits the repository,
has evidence for its behavior, and can be judged by an independent reviewer
without reconstructing the implementation conversation.
