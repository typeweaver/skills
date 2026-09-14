# Boundaries, Public Interfaces, and Structure

Use this reference in step 2 of the procedure. Trees are growth consequences,
not starting templates. Do not reproduce them mechanically.

## Protect module and runtime boundaries

Prefer UI dependencies that flow from `app` to `features` to shared product
components to shared UI. Let server dependencies flow from feature operations
through domain or platform contracts to infrastructure. These are ownership
directions, not required folders. Hide storage, transport, credentials, and
vendor details behind the narrowest meaningful contract.

- Expose intentional feature entry points; reject deep imports into another
  feature's internals.
- Compose peer features in `app` or an explicit workflow instead of importing
  one feature's UI or internals into another. When several features reuse a
  headless capability, move that capability below them rather than choosing one
  feature as the accidental owner.
- Keep server-only, client-only, and environment-neutral exports distinct. Do
  not re-export them through one ambiguous barrel.
- Use entry points such as `feature`, `feature/server`, and `feature/client`
  only when real consumers need those different runtime capabilities. Do not
  add symmetric barrels by convention.
- Mark sensitive modules with `server-only` and browser-bound modules with
  `client-only` when that makes invalid imports fail early.
- Give browser reads a browser-safe transport. A client query must not import a
  server-only feature operation; let a Route Handler or the repository's
  established client transport delegate to that operation.
- Pass only the data a Client Component needs across the server/client
  boundary, using an explicit serializable DTO or view model rather than raw
  storage or vendor objects.
- Prefer route-level composition when two features only need to appear or react
  to the same route state together.
- When the repository's scale makes boundary drift costly, enforce public
  entry points and forbidden import directions with its package, lint, or
  dependency checks. Do not introduce enforcement tooling merely because this
  skill was invoked. Read an existing import allowlist as evidence: each
  approved edge is a boundary decision, and edges that service a cycle are
  debt.

## Start from one capability

The smallest server-read capability often starts with three files: a page that
owns the route contract, a feature composition root, and its server operation.
Omit the operation when the capability needs no server data. Direct imports are
honest until a named external consumer appears.

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
paths to the repository (`app/` + `lib/` is fine). File suffixes such as
`.server.ts` and `.action.ts` are illustrative; the contract is the runtime
marker (`server-only`, `'use server'`, `"use client"`), so follow the
repository's naming.

## Grow one pressure at a time

| Pressure                                        | Add only then                                                                                  |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| One feature, one route consumer                 | Direct imports                                                                                 |
| Page should not know internal layout            | One composition root export                                                                    |
| Named external compositor needs a feature part  | Public widget + optional `index.ts`                                                            |
| External server consumer (Route Handler)        | `server.ts` with `server-only`                                                                 |
| External client consumer (provider/commands)    | `client.ts` with `"use client"`                                                                |
| Browser read of server data                     | HTTP transport, not a Server Action                                                            |
| Mutation from a Client Component                | `'use server'` adapter, or the existing HTTP transport when a client cache owns reconciliation |
| Shared transient workflow across client islands | Scoped feature provider and store                                                              |
| Behavior spanning independent features          | Explicit workflow feature                                                                      |
| Headless capability reused across features      | Lower domain or platform contract                                                              |

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
