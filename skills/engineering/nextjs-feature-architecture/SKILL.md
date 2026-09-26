---
name: nextjs-feature-architecture
description: Decide where a Next.js App Router feature belongs and who owns its
  route, state, server work, client interaction, and cache. Use when adding or
  restructuring a page or feature, choosing a state owner, or reviewing App
  Router boundaries. Not for styling, version upgrades, or debugging one
  component.
---

# Next.js Feature Architecture

Assign owners before choosing files, providers, or libraries. If you catch
yourself adding a store or directory before you can name the responsibility it
holds, stop and name that responsibility first.

Work within the requested scope. For a fix, change the boundary needed for the
fix. For a redesign, account for each boundary being moved. For a review,
report the boundary problem and its consequence without changing code.

Follow the target repository's conventions and installed Next.js version.
Verify version-sensitive APIs against that version when they affect the design.
The paths in this skill describe ownership, not a required folder structure.

A feature operation is the server-side entry point for one use case. It owns
authorization, orchestration, and the data contract. A browser query cache is
a client-side copy of server data, such as TanStack Query.

## Decide ownership

1. **Route:** The route owns the request contract. Normalize inputs before
   feature behavior or cache keys consume them. A layout owns only what persists
   across its child routes; a page composes the feature surfaces for its route.
   Read [ownership](references/ownership.md) when deciding a feature split,
   layout boundary, or cross-feature workflow.
2. **Feature:** A feature owns one user capability: its behavior, operations,
   and UI composition. Keep pieces together while their policy and lifecycle
   change together. Expose a widget only when a named external compositor needs
   it. Read [boundaries](references/boundaries.md) when adding a public entry
   point, shared module, or cross-feature import. For a shadcn and Tailwind
   repository, use the [UI mapping](references/shadcn.md).
3. **State:** Give each value one authoritative owner. Use the URL for a
   confirmed view that Back or a copied link must restore, local state for one
   interaction, a browser query cache for a browser server-data lifecycle, and
   a scoped store for a shared transient workflow. The server remains the
   authority for persisted data. Read [state coordination](references/state-coordination.md)
   when values cross widgets, need optimistic updates, or persist in the browser.
4. **Runtime:** Start with Server Components. Put browser interaction behind the
   smallest useful Client Component boundary. A browser read needs a browser
   transport; a server read calls the feature operation directly. Read
   [server composition](references/server-composition.md) when choosing a
   Server Function, Route Handler, or component boundary.
5. **Lifecycle:** Place Suspense and error boundaries around regions with their
   own loading or failure behavior. Treat empty and expected failures as
   product outcomes. Read [loading and failure](references/loading-and-failure.md)
   when a boundary or fallback is part of the decision.
6. **Cache:** Name each cache's identity, freshness, and invalidation owner.
   A server cache and a browser query cache have separate invalidation
   paths. Read [caching](references/caching.md) when adding caching or a mutation
   that changes cached data.

Use one worked scenario only when it resolves an open decision:
[search](references/examples/search-page.md) for a URL-owned view,
[dashboard](references/examples/operations-dashboard.md) for mixed widget
lifecycles, [editor](references/examples/editor-workflow.md) for an unsaved
working copy, or [master-detail](references/examples/master-detail-workspace.md)
for navigable selection.

## Finish

State the owner of each changed route input, behavior, state value, and cache.
Show where runtime and feature boundaries meet. If two places can write the
same value, or a mutation invalidates a cache the UI does not read, the design
is unfinished.

In a review, lead with broken runtime imports, competing state writers, or
cache invalidation that cannot reach its reader. Name the affected file and the
owner that should hold the responsibility. Keep existing debt separate from
problems introduced by the change.
