---
name: scaffold-it
description: Materialize an approved engineering plan as a reviewable code and
  test scaffold before implementation. Use when an approved plan introduces or
  moves module ownership, public contracts, dependency edges, data flow, or
  package boundaries and needs a separate structure review. Skip changes that
  introduce or move none of those boundaries.
---

# Scaffold It

Turn an approved plan into a green, inert scaffold that exposes the proposed
structure before implementation hides it in code volume. The scaffold is a
reviewed baseline for `craft-it`, not a first implementation or an exhaustive
prescription: it records where behavior is expected to belong and what callers
and tests are expected to observe while leaving implementation discovery open.

## Decide whether a scaffold earns a review

Read the approved plan, repository instructions, current architecture, public
surfaces, dependency rules, test layout, and CI command. Use a scaffold when the
change introduces or moves an owning module, public contract, dependency edge,
data flow, or package boundary.

If every changed responsibility already has one clear owner and the plan changes
no boundary above, report that a separate scaffold would add no review signal
and leave the repository untouched.

The plan is not approved structure while the scaffold would have to choose a
public field, variant, function argument, result, failure form, owner, or
dependency direction. Stop and return those decisions to planning instead of
inventing a contract and labeling it reviewed.

## Establish the review baseline

Record these as the proposed structure for review:

- source and test files that establish an ownership boundary;
- the responsibility owned by each module and the dependencies it may use;
- caller-visible types, schemas, ports, props, and function contracts;
- observable behavior, failure, and edge cases that tests must cover.

Private helpers, local types, algorithms, internal data structures, and
additional tests inside those boundaries stay open for implementation. Do not
pre-create a private file merely because the plan predicts it; its necessity is
not an architectural decision yet.

## Materialize the scaffold

1. Create each new architecture-bearing file at its intended path. Annotate an
   existing source or test file when the responsibility already belongs there.
2. Add real type-level or declarative contracts when the repository can express
   them without wiring in the feature. Keep existing runtime behavior unchanged.
   Represent a planned runtime function with its contract type or an annotation,
   never a dummy value or a body that throws "not implemented".
3. Use [assets/scaffold-template.md](assets/scaffold-template.md) and the
   repository's comment syntax. Prefix every temporary instruction with
   `@scaffold` so implementation can find and discharge it. These annotations
   are planning artifacts, not durable source documentation.
4. Put test intent at the path that will own the tests. Create the intended test
   file for a new boundary. For an existing module, add cases to its existing
   test file unless the repository's test structure requires a new one. Use
   native pending-test syntax when it stays green; otherwise use comments.
5. Update manifests, entry points, workspace catalogs, architecture maps, and
   user documentation only where the proposed boundary makes them true. Keep
   runtime wiring out of the scaffold.

Each test case names a trigger and observable result. Include failure or edge
conditions the contract requires. A placeholder assertion that passes proves
nothing; leave the case visibly pending instead.

## Check the review artifact

Run the repository's formatting, lint, type, test, architecture, and generation
checks that apply. Existing behavior and CI must remain green. Then inspect the
complete diff:

- every production and test file exists because it exposes a reviewed decision;
- every `@scaffold` marker maps to one implementation or test obligation;
- no runtime path exposes unfinished behavior;
- no private helper or generic layer was invented without a present owner.

Report the plan, created and annotated files, reviewed baseline, open
implementation choices, checks with their results, and any reason the scaffold
cannot stay green. Stop before implementation, commit, or pull-request work.

The scaffold is ready when another agent can implement the approved behavior
without rediscovering the proposed ownership, dependencies, public contracts,
or test intent, and a reviewer can judge those decisions from this diff alone.
