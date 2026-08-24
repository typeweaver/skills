---
name: nextjs-feature-architecture
description: Design, implement, refactor, or review features in Next.js App
  Router codebases using feature-oriented server composition. Use when deciding
  route and page responsibilities, feature boundaries, Server and Client
  Components, state ownership, data access, Suspense, errors, mutations,
  caching, or dependency direction. Respect the target repository and do not
  impose this architecture unless architectural change is allowed.
---

# Next.js Feature Architecture

Keep an App Router feature explainable as:

```text
request -> route contract -> page composition -> feature -> data access
```

Apply this as an ownership model, not a directory template. Follow the target
repository and its installed Next.js version. Verify current documentation
before choosing version-sensitive request, rendering, mutation, or caching
APIs.

## Preserve six invariants

1. Routes own the request contract.
2. Pages compose features.
3. Features own behavior.
4. Every state value has one authoritative owner.
5. Server Components are the default.
6. Dependencies cross explicit, environment-safe boundaries.

Add structure only when it protects one of these boundaries.

## Use ownership vocabulary

- A **feature** owns application behavior or a user capability.
- A **widget** is an independently composable UI region exposed by a feature,
  with its own data requirements and UX lifecycle. It is not another
  architecture layer: a feature may expose several widgets, and a widget does
  not require its own directory.
- **Shared UI** provides reusable presentation without feature ownership.

Use this heuristic:

```text
Application behavior or user capability? -> feature
Independently composable feature region?  -> widget
Reusable presentation without ownership? -> shared UI
Used by only one feature?                 -> keep it in that feature
```

## Run the decision loop

1. Which route owns the request contract?
2. Which feature owns the behavior?
3. Which independently composable regions should that feature expose as
   widgets?
4. Who is the authoritative owner of each state value?
5. Can this stay on the server?
6. What can render, fail, or refresh independently?
7. Which feature operation owns the data access?
8. What is the cache and freshness contract?
9. Do dependencies cross only public, runtime-safe boundaries?

## Establish ownership

- Treat `params`, `searchParams`, cookies, headers, locale, and other request
  inputs as boundary data. The route owns their contract semantically but need
  not resolve every value eagerly at the top of the tree.
- Resolve request-time values at the narrowest boundary that needs them. Parse,
  validate, normalize, and default each value there before feature behavior
  uses it, preserving static regions when the rendering model allows it.
- Verify identity and authorization on the server; never trust client-provided
  claims merely because route inputs were parsed.
- Pass normalized request values into cached or otherwise reusable work.
- Keep pages as composition roots: select feature regions, pass route state,
  and place loading and error boundaries. Move domain behavior, persistence,
  query construction, and substantial mapping into their owning feature.
- Keep feature UI, contracts, operations, and actions together. Create
  subdirectories only as responsibilities emerge.
- Keep feature-specific components, hooks, operations, and utilities inside
  their owner; do not turn global technical folders into dumping grounds.
- Give a workflow that genuinely spans multiple features an explicit
  orchestration owner. Do not hide cross-feature behavior in one participant or
  in a generic shared folder.
- Move code to `shared` only when it has multiple real consumers and no feature
  is its natural owner.

## Protect module and runtime boundaries

Prefer dependencies that flow from `app` to `features` to `shared`. Hide
storage, transport, credentials, and vendor details behind meaningful feature
operations.

- Expose intentional feature entry points; reject deep imports into another
  feature's internals.
- Keep server-only, client-only, and environment-neutral exports distinct. Do
  not re-export them through one ambiguous barrel.
- Use entry points such as `feature`, `feature/server`, and `feature/client`
  when consumers need different runtime capabilities.
- Mark sensitive modules with `server-only` and browser-bound modules with
  `client-only` when that makes invalid imports fail early.
- Pass only the data a Client Component needs across the server/client
  boundary, using serializable values.
- Prefer route-level composition when two features only need to appear or react
  to the same route state together.

## Assign state deliberately

Choose one authoritative owner for every state value:

| State                               | Typical owner                       |
| ----------------------------------- | ----------------------------------- |
| Navigable or shareable view state   | URL                                 |
| Transient interaction state         | Local Client Component              |
| Persistent UI preference            | Cookie or browser storage           |
| Authoritative entity data           | Server or data layer                |
| Temporary optimistic projection     | Client with explicit reconciliation |
| Continuously refreshed browser data | Client cache, when justified        |

- Put state in the URL when opening a copied URL should restore the view.
- Treat URL changes as navigation. Prefer links or forms where they fit, and
  centralize parameter semantics and dependent resets such as pagination.
- Do not introduce Context, a global store, or a client query cache merely to
  avoid deciding ownership.
- Allow derived or optimistic copies only when their source and reconciliation
  behavior are explicit.

## Compose from the server

- Start with Server Components. Introduce a Client Component only for browser
  APIs, effects, local interaction, event handlers, high-frequency updates, or
  optimistic feedback.
- Keep `"use client"` boundaries close to the interaction because every import
  below that boundary enters the client module graph.
- Let a server-rendered widget own what data it needs; let a feature operation
  own how that data is obtained.
- Start independent work independently. Keep sequential work only when one
  result truly depends on another.
- Use Server Functions or Actions for mutations initiated by the application.
  Use Route Handlers when an HTTP boundary is itself required. Do not use
  Server Actions as general read APIs.
- Validate and authorize inside every trusted mutation boundary, then make
  invalidation or refresh behavior explicit.
- Prefer links and forms for navigation and form-like interactions when they
  provide a useful baseline; add client behavior for material UX improvements.

## Design loading, failure, and caching

- Place Suspense around regions that can meaningfully load, stream, reveal, or
  refresh independently. Use route-level loading files when the whole segment
  shares that lifecycle.
- Match each fallback to the visual shape it replaces. Reset a boundary with a
  key only when the content identity truly changed.
- Model empty results, validation failures, denied access, rejected mutations,
  and known dependency failures as expected outcomes.
- Reserve error boundaries and route error handling for unexpected failures.
  Define loading, empty, expected-failure, and unexpected-failure behavior
  before declaring the feature complete.
- Treat caching as part of each server operation's data contract, not as an
  incidental optimization. Keep the policy near the operation and define what
  is cached, what identifies the cache entry, how long it may be stale, what
  invalidates it, who owns that invalidation, and how users or tenants remain
  isolated.
- Use the caching primitives established by the repository's Next.js version;
  never assume historical defaults still apply.

## Verify the result

Implement the smallest complete slice. Test pure route parsing and feature
operations directly; test navigation, rendering, mutation, and cache wiring at
their integration boundaries.

Confirm that:

- external inputs become typed state before reaching feature logic;
- pages compose rather than implement features;
- every behavior and state value has a clear authoritative owner;
- Server Components remain the default and client boundaries stay narrow;
- server-only code cannot enter the client graph;
- consumers use public feature APIs rather than internals;
- infrastructure details remain below feature operations;
- independent work is not accidentally serialized;
- loading and failure boundaries match meaningful user experiences;
- mutations validate, authorize, and invalidate deliberately;
- caching has explicit identity, freshness, invalidation ownership, and
  isolation semantics;
- abstractions and shared code represent real boundaries rather than ceremony.

Correct unclear ownership or dependency direction before adding another layer.
