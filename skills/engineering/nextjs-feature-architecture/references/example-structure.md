# Feature Structure and Public Interfaces

Use this reference when a feature grows beyond one composition root or needs a
second consumer. Trees are growth consequences, not starting templates. Do not
reproduce them mechanically.

The default remains two files: a page that owns the route contract, and a
feature composition root plus its server operation. Direct imports are honest
until a named second consumer appears.

## Start with one complete capability

```text
app/projects/[projectId]/page.tsx
features/project-overview/project-overview.tsx
features/project-overview/get-project-overview.server.ts
```

- The page validates the route contract and renders `ProjectOverview`.
- `project-overview.tsx` owns the capability lifecycle and expected outcomes.
- `get-project-overview.server.ts` owns authorization, data access, mapping,
  and caching. It imports `server-only`.

Do not add a barrel, `widgets/` folder, provider, store, Route Handler, or
`server.ts` / `client.ts` before another responsibility requires it. Adapt
paths to the repository (`app/` + `lib/` is fine).

## Grow one pressure at a time

| Pressure                                        | Add only then                         |
| ----------------------------------------------- | ------------------------------------- |
| One feature, one route consumer                 | Direct imports                        |
| Page should not know internal layout            | One composition root export           |
| Second route composes a subset of the feature   | Public widgets + optional `index.ts`  |
| External server consumer (Route Handler)        | `server.ts` with `server-only`        |
| External client consumer (provider/commands)    | `client.ts` with `"use client"`       |
| Browser read of server data                     | HTTP transport, not a Server Action   |
| Mutation from a Client Component                | `'use server'` adapter file           |
| Shared transient workflow across client islands | Scoped feature provider and store     |
| Behavior spanning independent features          | Explicit workflow feature             |

Avoid `ui/model/server/actions` directories, repository layers, and symmetric
barrels that exist only because a diagram contained them. Collapse query-key,
query-options, and fetcher modules into one client module until they diverge.

## Keep the page a composition root

For a single-feature page, export one root (`Search`, `ProjectDashboard`,
`DocumentEditor`). The page parses the route contract and renders that root.
The feature hides widgets, Suspense cuts, and data access.

Expose individual widgets only when a second route actually composes a subset.
Master-detail is that case: two features meet at the route.

Pass Server widgets into a client provider as `children` or slots from the
Server page so they stay in the server graph.

## Protect dependency direction

```text
app page ──► feature composition root
                └──► shared UI
browser query ──► Route Handler ──► feature server operation
status client ──► Server Function adapter ──► private server operation
```

- `app` composes public feature surfaces; features never import from `app`.
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
- [shadcn.md](shadcn.md) — only when shared UI uses shadcn and Tailwind
