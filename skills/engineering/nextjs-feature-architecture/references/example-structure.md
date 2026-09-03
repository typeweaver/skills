# Feature Structure and Public Interfaces

Use this reference when a feature grows beyond one composition root or a named
external compositor needs part of it. Trees are growth consequences, not
starting templates. Do not reproduce them mechanically.

The smallest server-read capability often starts with three files: a page that
owns the route contract, a feature composition root, and its server operation.
Omit the operation when the capability needs no server data. Direct imports are
honest until a named external consumer appears.

## Start with one complete capability

```text
app/projects/[projectId]/page.tsx
features/project-overview/project-overview.tsx
features/project-overview/get-project-overview.server.ts
```

- The page validates the route contract and renders `ProjectOverview`.
- `project-overview.tsx` owns the capability lifecycle and expected outcomes.
- `get-project-overview.server.ts` owns the use-case contract, authorization
  boundary, mapping, and cache policy. It imports `server-only` and delegates
  reused policy or data access to lower domain or platform contracts when they
  serve more than this feature.

Do not add a barrel, `widgets/` folder, provider, store, Route Handler, or
`server.ts` / `client.ts` before another responsibility requires it. Adapt
paths to the repository (`app/` + `lib/` is fine).

## Grow one pressure at a time

| Pressure                                        | Add only then                       |
| ----------------------------------------------- | ----------------------------------- |
| One feature, one route consumer                 | Direct imports                      |
| Page should not know internal layout            | One composition root export         |
| Named external compositor needs a feature part  | Public widget + optional `index.ts` |
| External server consumer (Route Handler)        | `server.ts` with `server-only`      |
| External client consumer (provider/commands)    | `client.ts` with `"use client"`     |
| Browser read of server data                     | HTTP transport, not a Server Action |
| Mutation from a Client Component                | `'use server'` adapter file         |
| Shared transient workflow across client islands | Scoped feature provider and store   |
| Behavior spanning independent features          | Explicit workflow feature           |
| Headless capability reused across features      | Lower domain or platform contract   |

Avoid `ui/model/server/actions` directories, repository layers, and symmetric
barrels that exist only because a diagram contained them. Collapse query-key,
query-options, and fetcher modules into one client module until they diverge.

## Keep the page a composition root

For a single-feature page, export one root (`Search`, `ProjectDashboard`,
`DocumentEditor`). The page parses the route contract and renders that root.
The feature hides widgets, Suspense cuts, and data access.

Expose individual widgets only when a named external compositor needs one. A
second route is one example; a page that interleaves independent features, a
parallel route, or a persistent layout may create the same pressure.
Master-detail is a common case: two features meet at the route.

Pass Server feature surfaces into a client provider as `children` or slots from
their Server composition boundary so they stay in the server graph.

## Protect dependency direction

```text
app page ──► feature composition root
                └──► shared UI
browser query ──► Route Handler ──► feature server operation
status client ──► Server Function adapter ──► private server operation
feature server operation ──► domain/platform contract ──► infrastructure
workflow ──► public participant operations or injected ports
```

- `app` composes public feature surfaces; features never import from `app`.
- Peer features meet in `app` or an explicit workflow; they do not import one
  another.
- Domain and platform modules do not depend on route-facing features.
- Client modules never import `.server.ts` operations or `server-only` barrels.
- Server entry points never re-export client hooks or providers.

## Choose the matching worked example

Load at most one:

- [examples/search-page.md](examples/search-page.md) — URL-owned search
- [examples/operations-dashboard.md](examples/operations-dashboard.md) —
  mixed freshness across widgets
- [examples/editor-workflow.md](examples/editor-workflow.md) — unsaved
  working copy
- [examples/master-detail-workspace.md](examples/master-detail-workspace.md) —
  navigable selection and route slots
