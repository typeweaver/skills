# Operations Dashboard

Use this scenario for a dashboard whose filters, metrics, activity feed, and
status controls have different rendering and freshness needs. It demonstrates
one feature exposing several widgets, runtime-separated public interfaces, and
a scoped client workflow without turning the dashboard into one client-owned
state tree.

Read [../state-coordination.md](../state-coordination.md) and
[../example-structure.md](../example-structure.md) first.

## Shape the feature around one capability

Default tree after mixed freshness appears. Comparison/Zustand is a later
pressure, not part of this tree.

```text
app/projects/[projectId]/page.tsx
app/api/projects/[projectId]/activity/route.ts
features/project-dashboard/project-dashboard.tsx
features/project-dashboard/dashboard-view.ts
features/project-dashboard/dashboard-activity.client.ts
features/project-dashboard/get-dashboard-metrics.server.ts
features/project-dashboard/get-dashboard-activity.server.ts
features/project-dashboard/update-project-status.action.ts
features/project-dashboard/update-project-status.server.ts
features/project-dashboard/dashboard-metrics-skeleton.tsx
```

`ProjectDashboard` is the composition root the page renders. Add `index.ts` /
`server.ts` only when a second consumer appears (the activity Route Handler
earns `server.ts` for `getDashboardActivity`). Collapse query-key, query
options, and fetcher into `dashboard-activity.client.ts`. Add a scoped store
only when a real multi-island workflow (comparison tray) exists.

Keep these widgets in one feature while they express one project-operations
capability and share its language and policies. Do not make every widget a
feature merely because it can render independently.

Keep query factories, stores, raw setters, and feature-internal operations
private. If the Route Handler, polling, or another named consumer disappears,
remove its entry point.

## Assign state by lifecycle

| Value                                   | Owner                                   |
| --------------------------------------- | --------------------------------------- |
| Project identity                        | Route param                             |
| Confirmed range and team filters        | Normalized URL search params            |
| Current aggregate metrics               | Server operation and its cache contract |
| Refreshing activity feed                | TanStack Query browser cache            |
| Authoritative project status            | Server                                  |
| Temporary status projection             | Mutation lifecycle or query cache       |
| Comparison candidates and tray state    | Scoped feature Zustand store            |
| Hovered chart point or open widget menu | Local widget state                      |

The URL, query cache, and store solve different problems. Do not mirror the
range into Zustand, copy the activity result into the store, or put comparison
selection into the URL unless copied links must restore that workflow.

## Compose independent lifecycles

```text
ProjectPage
└── ProjectDashboard          // parses route inputs; hides the grid
    ├── DashboardFilters
    ├── Suspense(DashboardMetrics, DashboardMetricsSkeleton)
    ├── DashboardActivity
    └── DashboardStatus
```

- The page renders `ProjectDashboard` and does not assemble widgets.
- Pass any client provider from the Server page with Server widgets as
  `children` so they stay in the server graph.
- `DashboardMetrics` remains a Server Component and calls its operation
  directly when it needs no browser cache lifecycle.
- `DashboardActivity` may hydrate a matching TanStack Query when polling,
  focus refetch, or client navigation reuse materially improves the product.
- `DashboardStatus` owns its mutation experience and coordinates only the
  affected server-data projections.
- The provider wraps only widgets participating in comparison. Narrow it
  further if the page layout allows that without awkward composition.

Independent server operations should start independently. Do not fetch metrics
and activity sequentially at the page merely because both widgets are visible.

## Make browser cache identity complete

Separate query identity, browser transport, and server behavior:

```text
DashboardActivity
  -> dashboard-activity-query.client.ts
  -> fetch-dashboard-activity.client.ts
  -> GET /api/projects/:projectId/activity
  -> activity/route.ts
  -> project-dashboard/server
  -> get-dashboard-activity.server.ts
```

The client query must not import `project-dashboard/server` or the server
operation. The Route Handler validates HTTP input and delegates to the
authorized feature operation.

Define the neutral query key from normalized inputs:

```text
projectActivityKey({ tenantId, projectId, range, team })
  -> ['project-activity', { tenantId, projectId, range, team }]
```

Include every value that changes authorization or results. Keep polling,
freshness, retry, and invalidation policy with this query contract.

When prefetching:

- create a request-scoped query client;
- prefetch only data consumed through the browser cache;
- hydrate the exact key the client widget will read;
- let server prefetch call the server operation while the client query calls
  the browser fetcher; share the key and result contract, not an unsafe query
  function across runtimes;
- avoid duplicating a Server Component read and a client query unless the
  transition between them is deliberate.

If activity requires a project permission result before its request can begin,
decide whether this is a real authorization dependency. Prefer one authorized
server operation over a client waterfall when the browser never needs the
intermediate result.

## Reconcile mutations across widgets

A project-status mutation may affect the status card, activity feed, and
aggregate metrics. Reconcile each projection through its actual owner.

On the server, inside the `'use server'` adapter that delegates to the private
operation:

1. Validate authorization and expected revision.
2. Persist the mutation before invalidating anything.
3. Expire the tagged server cache with the API that matches freshness: with
   Cache Components, `updateTag` (or `revalidatePath` / `refresh()`) already
   re-renders the current route; `revalidateTag` is stale-while-revalidate.
   Without Cache Components, use the repo's `revalidateTag` / `revalidatePath`.
4. Return the confirmed status and any activity projection the browser can
   reconcile.

In the client mutation lifecycle, update or invalidate only TanStack keys that
actually live in the browser. Do not add `router.refresh()` after an Action that
already re-rendered the route. Do not call `queryClient.invalidateQueries` for
metrics that exist only in a Server Component.

Do not place this server-data reconciliation in the comparison store. The
store owns only its transient workflow.

## Scope the Zustand workflow

Create one vanilla store per `ProjectDashboardProvider` instance. Initialize
it from the same serializable values on the server and client, and reset or key
it when `projectId` changes.

Expose focused selectors and commands such as:

```text
selectCandidate(candidateId)
removeCandidate(candidateId)
startComparison()
clearComparison()
```

Keep `setState`, persistence mechanics, query clients, entities, and URL
filters outside the public client contract. Server Components must not read
the store.

## Split only when ownership really differs

If the page instead composes widgets from unrelated features, route filters
may still coordinate them passively: normalize one URL contract and pass the
relevant values to each feature.

Introduce a workflow feature only when a command actively coordinates those
features, such as selecting incidents and deploying a shared remediation. The
workflow owns commands and transient state; participant features depend on its
public client contract and never import one another.

## Handle hard cases

- **Partial failure:** Metrics, activity, and status keep separate expected
  failure and retry experiences when one can remain useful without another.
- **Tenant changes:** Authorization, cache keys, provider identity, and any
  persisted comparison state must change together.
- **Polling during mutation:** Prevent a background response from overwriting
  a newer optimistic or confirmed status.
- **Hydration:** Server prefetch and client consumption must use identical
  normalized input and freshness policy.
- **Permission changes:** Treat denied data after a refetch as an expected
  domain outcome and remove sensitive cached projections.
- **Large dashboards:** Measure waterfalls, client bundle growth, selector
  churn, and polling load before adding a coordinator or aggregate endpoint.

## Avoid

- One application-wide dashboard store containing URL, queries, and entities.
- One `Promise.all` page loader whose failure blocks every widget.
- Hydrating every server read into TanStack Query by default.
- Invalidating the entire query cache after every status mutation.
- Importing `get-dashboard-activity.server.ts` from a browser query function.
- Treating a Server Component metrics cache as a TanStack Query cache.
- A default feature barrel that re-exports server operations and client hooks.
- Splitting filters, metrics, activity, and status into separate features
  without different product ownership.

## Verify

- Contract tests cover URL normalization and complete query identities.
- Integration tests prove independent loading, failure, and retry behavior.
- Mutation tests cover success, rollback, stale in-flight reads, partial
  invalidation, server-render refresh, and concurrent revisions.
- Transport tests prove the browser calls the Route Handler and server-only
  operations remain outside the client graph.
- Store tests cover semantic commands, project changes, and provider isolation.
- Authorization and cache tests prove user and tenant isolation.
