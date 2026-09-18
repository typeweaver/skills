# Boundaries, Public Interfaces, and Structure

Step 2 of the procedure. Trees are growth consequences, not starting
templates. Do not reproduce them mechanically.

## Protect dependency direction

```text
app page ──► feature composition root
                └──► shared UI
browser query ──► Route Handler ──► feature operation
client component ──► Server Function ──► private feature operation
feature operation ──► domain/platform contract ──► infrastructure
workflow ──► public participant operations or injected ports
```

UI dependencies flow from `app` to `features` to shared product components to
shared UI. Server dependencies flow from feature operations through domain or
platform contracts to infrastructure. These are ownership directions, not
required folders.

- `app` composes public feature surfaces; features never import from `app`.
- Peer features meet in `app` or an explicit workflow; they do not import one
  another. When several features reuse a headless capability, move that
  capability below them rather than choosing one feature as the accidental
  owner.
- Reject deep imports into another feature's internals.
- Domain and platform modules do not depend on route-facing features.
- Hide storage, transport, credentials, and vendor details behind a contract
  whose signature names no vendor type.

## Separate the runtimes

- Keep server-only, client-only, and environment-neutral exports distinct. Do
  not re-export them through one ambiguous barrel, and do not re-export client
  hooks or providers from a server entry point.
- Add `feature/server` or `feature/client` only when a module outside the
  feature already imports from it and would otherwise pull the other runtime
  into its graph. An entry point with no importer outside the feature is a
  symmetric barrel; delete it.
- Mark sensitive modules with `server-only` and browser-bound modules with
  `client-only` when that makes invalid imports fail early. Client modules
  never import a `server-only` operation.
- Give browser reads a browser-safe transport. A browser query must not import
  a server-only feature operation; let a Route Handler or the repository's
  established client transport delegate to that operation.
- Pass only the data a Client Component needs across the server/client
  boundary, using an explicit serializable DTO or view model rather than raw
  storage or vendor objects.
- Prefer route-level composition when two features only need to appear or react
  to the same route state together.
- Add or extend an import rule only when the repository already enforces
  boundaries with a package, lint, or dependency check. Read an existing import
  allowlist as evidence: each approved edge is a boundary decision, and edges
  that service a cycle are debt.

## Start from one capability

The smallest server-read capability often starts with three files: a page that
owns the route contract, a feature composition root, and its feature
operation. Omit the operation when the capability needs no server data. Direct
imports are honest until a named external consumer appears.

```text
app/projects/[projectId]/page.tsx
features/project-overview/project-overview.tsx
features/project-overview/get-project-overview.server.ts
```

- The page validates the route contract and renders `ProjectOverview`.
- `project-overview.tsx` owns the capability lifecycle and expected outcomes.
- `get-project-overview.server.ts` is the feature operation: it owns the use
  case, authorization boundary, mapping, and cache policy. It imports
  `server-only` and delegates
  reused policy or data access to lower domain or platform contracts when they
  serve more than this feature.

Do not add a barrel, `widgets/` folder, provider, store, Route Handler, or
`server.ts` / `client.ts` before another responsibility requires it. Adapt
paths to the repository (`app/` + `lib/` is fine). File suffixes such as
`.server.ts` and `.action.ts` are illustrative; the contract is the runtime
marker (`server-only`, `'use server'`, `"use client"`), so follow the
repository's naming.

Avoid `ui/model/server/actions` directories, repository layers, and symmetric
barrels that exist only because a diagram contained them. Collapse query-key,
query-options, and fetcher modules into one client module until they diverge.

## Grow one pressure at a time

| Pressure                                        | Add only then                                                                                  |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| One feature, one route consumer                 | Direct imports                                                                                 |
| Page should not know internal layout            | One composition root export                                                                    |
| Named external compositor needs a feature part  | Public widget + optional `index.ts`                                                            |
| External server consumer (Route Handler)        | `server.ts` with `server-only`                                                                 |
| External client consumer (provider/commands)    | `client.ts` with `"use client"`                                                                |
| Browser read of server data                     | HTTP transport, not a Server Function                                                          |
| Mutation from a Client Component                | Server Function, or the existing HTTP transport when a browser query cache owns reconciliation |
| Shared transient workflow across client islands | Scoped feature provider and store                                                              |
| Behavior spanning independent features          | Explicit workflow feature                                                                      |
| Headless capability reused across features      | Lower domain or platform contract                                                              |

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
