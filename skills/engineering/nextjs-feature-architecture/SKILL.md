---
name: nextjs-feature-architecture
description: Decide where each part of a Next.js App Router feature lives —
  route contract, page composition, feature, shared UI, state owner, and the
  Server/Client Component boundary. Use when adding or restructuring a feature,
  page, layout, or route; when choosing between the URL, the server, a browser
  query cache, or a client store for a state value; when wiring Server
  Functions, Suspense, or cache invalidation across a feature; or when
  reviewing an App Router change for ownership and dependency direction. Not
  for Next.js version upgrades, styling, or debugging one failing component or
  Server Function.
---

# Next.js Feature Architecture

Every decision here assigns an owner. Name the owner before adding the
structure that holds it. If you catch yourself creating a store, provider,
barrel, or directory before you have named the owner of the value it holds,
stop and run step 1.

```text
request -> route contract -> page composition -> feature -> data access
```

This is an ownership model, not a directory template. Follow the target
repository and its installed Next.js version. Version-sensitive APIs
(`error.tsx` props, cache primitives, request APIs) change between releases:
verify against the installed version, and when you cannot, say so instead of
asserting.

Three terms, used exactly. A **Server Function** is a `'use server'` function a
Client Component can call; this skill never says Server Action or adapter. A
**feature operation** is the server-side entry point that owns one use case:
authorization, orchestration, mapping, and cache policy. A **browser query
cache** is the client-side cache of server data, such as TanStack Query.

## Set the architecture scope

Do not preserve a boundary merely because it exists, and do not impose this
model unless the task authorizes architectural change.

- Implementation or fix: keep the app working, extract one capability from the
  existing route, and leave neighboring routes alone. Surface leftover old
  boundaries as debt with a repayment trigger instead of restructuring them.
  This skill selects an architectural lens; it does not expand the scope.
- Authorized redesign or migration: name the target owner for every piece you
  will move and the order of the behavior-preserving steps before moving
  anything. Do not rewrite the application to match a reference tree.
- Review or assessment: report findings only; propose, do not restructure. Use
  `review-it`'s severities. **Blocking** — wrong as written: a client module
  imports a `server-only` operation, two places write one state value, or a
  mutation invalidates a cache the shown UI never reads. **Important** — the
  next change pays: a deep import into another feature's internals, a state
  value with no named owner, or feature behavior in a page or layout.
  **Follow-up** — boundary debt this change did not introduce. Every finding
  names the invariant, quotes the file and import line, names the owner that
  should exist, and states the trigger that justifies repaying it. Order by the
  cost of leaving it.

## Preserve six invariants

1. Routes own the request contract.
2. Pages compose features.
3. Features own behavior.
4. Every state value has one authoritative owner.
5. Server Components are the default.
6. Dependencies cross explicit, environment-safe boundaries.

When the product has a shared visual language, Shared UI owns that language.
Add structure only when it protects one of these boundaries.

## Run the procedure

Work the steps in order for every feature, classifying each piece of behavior,
UI, and data with this heuristic:

```text
Application behavior or user capability? -> feature
Independently composable feature region? -> widget
Reusable visual or interaction primitive? -> shared UI
Reusable product composition, no natural feature owner? -> shared product component
Reusable headless policy or capability? -> domain or platform module
Feature-specific behavior or composition? -> keep it in that feature
```

Read the reference a step names before deciding that step; skip it only when
the step raises no decision.

1. **Name the owner of every part.**
   [references/ownership.md](references/ownership.md) holds the vocabulary, the
   feature-split test, and what routes, layouts, pages, and features own. When
   the repository uses shadcn and Tailwind, read
   [references/shadcn.md](references/shadcn.md) for the path mapping.
2. **Fix the dependency direction and the public surface.** Read
   [references/boundaries.md](references/boundaries.md) before adding a barrel,
   an entry point, a directory, or an import rule.
3. **Give every state value one owner.** A shallow URL update (`history.*`, and
   the default of libraries such as nuqs) changes the URL and client hooks
   only; Server Components and page `searchParams` do not re-render. Classify
   every value in the table in
   [references/state-coordination.md](references/state-coordination.md) before
   choosing a library.
4. **Compose from the server.** Read
   [references/server-composition.md](references/server-composition.md) before
   adding `"use client"` or choosing a mutation transport.
5. **Define loading and failure.** Read
   [references/loading-and-failure.md](references/loading-and-failure.md) when
   placing a Suspense boundary, a fallback, or an error boundary.
6. **Write the cache contract.** A server-render cache and a browser query
   cache are separate representations: `queryClient.invalidateQueries` cannot
   refresh a Server Component. Read
   [references/caching.md](references/caching.md) before caching a feature
   operation or invalidating one.

Load at most one worked scenario, and only when its situation matches:
[search-page.md](references/examples/search-page.md) for URL-owned search;
[operations-dashboard.md](references/examples/operations-dashboard.md) for
mixed freshness across widgets of one feature;
[editor-workflow.md](references/examples/editor-workflow.md) for an unsaved
working copy; and
[master-detail-workspace.md](references/examples/master-detail-workspace.md)
for navigable selection across route slots.

## Finish

The design is done when every state value has one named owner, every
cross-feature import goes through a public entry point, every cached feature
operation names what invalidates it and who owns that invalidation, and
loading, empty, expected-failure, and unexpected-failure behavior is defined.
