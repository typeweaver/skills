---
name: nextjs-feature-architecture
description: Design, implement, refactor, or review Next.js App Router
  architectures using feature-oriented server composition. Use when deciding
  route or page responsibilities, feature and UI boundaries, Server and Client
  Components, state ownership, data access, Suspense, errors, mutations,
  caching, or dependency direction. Use for redesigns or migrations only when
  the task authorizes architectural change.
---

# Next.js Feature Architecture

Keep an App Router feature explainable as:

```text
request -> route contract -> page composition -> feature -> data access
```

Apply this as an ownership model, not a directory template. Follow the target
repository and its installed Next.js version. Version-sensitive APIs
(`error.tsx` props, cache primitives, request APIs) change between releases:
verify against the installed version, and when you cannot, say so instead of
asserting.

## Set the architecture scope

Judge the existing architecture on its merits. Do not preserve a boundary
merely because it already exists, and do not impose this model unless the
task authorizes architectural change.

- When implementation is limited to a feature or fix, keep the app working,
  extract one capability from the existing route, and leave neighboring
  routes alone. Surface leftover old boundaries as debt with a repayment
  trigger instead of silently restructuring them.
- When the task includes an authorized redesign or migration, define a
  coherent target from these principles and move toward it in
  behavior-preserving steps. Do not rewrite the application to match a
  reference tree.
- Invoking this skill selects an architectural lens; it does not expand the
  requested scope.
- When the task is a review or assessment, report per invariant with one
  entry per finding: **Finding** (what violates which invariant), **Evidence**
  (files and import lines), **Owner** (who should own it), **Repay when** (the
  trigger that justifies the change). Order by the cost of leaving it. Propose;
  do not restructure.

## Preserve six invariants

1. Routes own the request contract.
2. Pages compose features.
3. Features own behavior.
4. Every state value has one authoritative owner.
5. Server Components are the default.
6. Dependencies cross explicit, environment-safe boundaries.

When the product has a shared visual language, Shared UI owns that language.
Add structure only when it protects one of these boundaries.

## Classify with this heuristic

```text
Application behavior or user capability? -> feature
Independently composable feature region?  -> widget
Reusable visual or interaction primitive? -> shared UI
Reusable product composition, no natural feature owner? -> shared product component
Reusable headless policy or capability?   -> domain or platform module
Feature-specific behavior or composition? -> keep it in that feature
```

## Run the procedure

Work the steps in order for every feature. Read the reference a step names
before deciding that step; skip the reference only when the step raises no
decision.

1. **Name the owner of every part.** Apply the heuristic above to each piece of
   behavior, UI, and data the task touches. Read
   [references/ownership.md](references/ownership.md) for the vocabulary, the
   feature-split test, and what routes, layouts, pages, and features own. When
   the repository uses shadcn and Tailwind, read
   [references/shadcn.md](references/shadcn.md) for the path mapping.
2. **Fix the dependency direction and the public surface.** Read
   [references/boundaries.md](references/boundaries.md) before adding a
   barrel, an entry point, a directory, or an enforcement rule.
3. **Give every state value one owner.** A shallow URL update (`history.*`, and
   the default of libraries such as nuqs) changes the URL and client hooks
   only; Server Components and page `searchParams` do not re-render. Read
   [references/state-coordination.md](references/state-coordination.md) and
   classify each value in its table before choosing a library.
4. **Compose from the server.** Read
   [references/server-composition.md](references/server-composition.md) before
   adding `"use client"` or choosing a mutation transport.
5. **Define loading and failure.** Read
   [references/loading-and-failure.md](references/loading-and-failure.md) when
   placing a Suspense boundary, a fallback, or an error boundary.
6. **Write the cache contract.** A server-render cache and a browser query
   cache are separate representations: `queryClient.invalidateQueries` cannot
   refresh a Server Component. Read
   [references/caching.md](references/caching.md) before caching a server
   operation or invalidating one.

Worked scenarios live in `references/examples/`; load at most one, and only
when its situation matches the task.

## Finish

The design is done when every state value has one named owner, every
cross-feature import goes through a public entry point, every cached server
operation names what invalidates it and who owns that invalidation, and
loading, empty, expected-failure, and unexpected-failure behavior is defined.
