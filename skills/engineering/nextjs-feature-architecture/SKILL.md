---
name: nextjs-feature-architecture
description: Decide ownership in a Next.js App Router feature.
  Use when adding or restructuring a feature, page, layout, or route,
  choosing a state owner, wiring Server Functions or cache invalidation, or reviewing App Router boundaries.
  Not for styling, version upgrades, or debugging one failing component.
---

# Next.js Feature Architecture

Your task is to give each part of an App Router feature one clear owner.
Name the owner before adding a store, provider, public entry point, or directory.

```text
request -> route contract -> page composition -> feature -> data access
```

This describes responsibility, not a folder template.
Follow the target repository's conventions and installed Next.js version.
But move an inherited boundary when the task calls for it and ownership becomes clearer.
Check version-sensitive APIs such as `error.tsx` props, request APIs, and cache primitives against that version
before relying on them.
If you cannot verify one, say so.

Work within the requested scope.
For a fix, change the boundary needed for the fix and leave neighboring routes alone.
Record remaining boundary debt with a reason to revisit it.
For an authorized redesign, name the new owners and move behavior in behavior-preserving steps.
For a review, report findings without changing code.

A **feature operation** is the server-side entry point for one use case.
It owns authorization, orchestration, mapping, and its data and cache contracts.
A **Server Function** is a function marked with `'use server'` that runs on the server
and can be called from a Client Component.
A **browser query cache** is a client-side copy of server data, such as TanStack Query.

## Decide ownership

**Route and page.** The route owns its request contract:
parse, validate, normalize, and default inputs before behavior or cache keys consume them.
The page composes public feature surfaces; a layout owns only what persists across its child routes.
Read [ownership](references/ownership.md) before assigning route, layout, page, or feature responsibility,
splitting a feature, or coordinating features.

**Feature and dependencies.** A feature owns one user capability,
including its behavior, operations, and UI composition.
Keep pieces together while policy and lifecycle change together.
Shared UI owns reusable visual and interaction primitives, without feature behavior or authoritative product state.
Expose a widget only when a named outside compositor needs it.
Read [boundaries](references/boundaries.md) before adding a public entry point, shared module, cross-feature import, or new architecture folder.
For a shadcn and Tailwind repository, read the [UI mapping](references/shadcn.md) before placing shared UI.

**State.** Give each value one authoritative owner.
Use the URL for a confirmed view that Back or a copied link must restore, local state for one interaction,
a browser query cache for browser-managed server data, and a scoped store for shared transient work.
The server remains authoritative for persisted data.
A shallow URL update through `history.*` changes client hooks
but does not rerender Server Components or refresh page `searchParams`.
Read [state coordination](references/state-coordination.md)
before choosing a state library or coordinating state across widgets,
and when URL behavior, optimistic updates, or browser persistence matter.

**Runtime.** Start with Server Components
and put browser interaction behind the smallest useful Client Component boundary.
A server read calls a feature operation directly.
A browser read needs a browser-safe transport.
Read [server composition](references/server-composition.md) before adding a Client Component boundary or choosing a Server Function or Route Handler.

**Loading and failure.** Give separate regions their own Suspense or error boundary
only when they have separate loading or failure behavior.
Treat empty results and expected failures as product outcomes.
Read [loading and failure](references/loading-and-failure.md) before placing a boundary or fallback.

**Cache.** Name what identifies a cache entry, how fresh it must be, and who invalidates it.
The server cache and browser query cache need separate invalidation paths:
`queryClient.invalidateQueries` cannot refresh a Server Component.
Read [caching](references/caching.md) before caching a feature operation or changing data shown by a cached reader.

Use a worked scenario when it resolves an open decision:
[search](references/examples/search-page.md) for a URL-owned view,
[dashboard](references/examples/operations-dashboard.md) for mixed widget lifecycles,
[editor](references/examples/editor-workflow.md) for an unsaved working copy,
or [master-detail](references/examples/master-detail-workspace.md) for navigable selection.

## Finish

State the owner of each changed route input, behavior, state value, and cache.
Show where runtime and feature boundaries meet, how mutations reach their readers,
and how loading, empty, expected-failure, and unexpected-failure states behave.
Cross-feature imports should use public entry points or an explicit workflow owner.
A design with two writers for one value, an unsafe client import,
or invalidation that cannot reach the shown UI is unfinished.

In a review, lead with **Blocking** findings that are wrong as written:
an unsafe runtime import, competing state writers, or ineffective cache invalidation.
Mark **Important** findings where the next change pays for a boundary problem,
such as a deep import into another feature or feature behavior in a page.
Keep **Follow-up** boundary debt separate from problems the change introduced.
For each finding, cite the affected file and import line where relevant,
name the consequence and intended owner, and state when the change is worth making.
Order findings by the cost of leaving them.
