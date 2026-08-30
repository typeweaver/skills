# State Coordination Across Widgets

Use this reference when several widgets read or change related state, or when
choosing between URL parameters, local React state, TanStack Query, Zustand,
cookies, and browser storage.

Assign ownership before choosing a library. Libraries implement a lifecycle;
they do not decide which lifecycle the product needs.

## Classify each value

| State or representation                | Typical owner                                  |
| -------------------------------------- | ---------------------------------------------- |
| Route identity                         | Route params                                   |
| Confirmed, shareable view              | Normalized URL search params                   |
| Widget-local draft or interaction      | Local Client Component                         |
| Authoritative entity                   | Server or data layer                           |
| Browser cache of server data           | Client query cache, when browser freshness matters |
| Temporary optimistic projection        | Mutation lifecycle or client query cache           |
| Shared transient client workflow       | Scoped feature store, when justified               |
| Persistent user preference             | Cookie or browser storage                      |
| Unsaved multi-widget working copy      | Scoped feature store with explicit base state  |
| Behavior spanning independent features | Explicit workflow feature                      |

Distinguish the authoritative source from a useful representation. A TanStack
Query cache may own the browser's current server-data projection while the
server remains authoritative. An editor store may own the unsaved working copy
while recording which server revision it was derived from.

## Decide by restoration and lifecycle

Ask in order:

1. Should a copied URL or browser Back restore the value? Put the confirmed
   value in the URL.
2. Is the value authoritative server data? Read it on the server unless a real
   browser freshness, polling, optimistic, or offline lifecycle justifies a
   client cache.
3. Is it used by one client island only? Keep it local.
4. Is it a transient workflow shared by several client islands? Use a scoped
   store at their smallest common boundary.
5. Must it survive a browser restart? Give persistence an explicit durability,
   versioning, hydration, and conflict contract.

Do not introduce Context, Zustand, or TanStack Query merely to avoid deciding
these questions.

## Coordinate common widget relationships

| Relationship                                        | Preferred coordination                         |
| --------------------------------------------------- | ---------------------------------------------- |
| Widgets respond to the same route filters           | One typed URL contract                         |
| Widgets display the same remote entity              | Shared query identity or server operation      |
| One widget changes another's navigable selection    | Semantic URL navigation                        |
| One widget changes ephemeral client workflow        | Scoped store command                           |
| A mutation affects browser-cache widgets            | Query-cache update or deliberate invalidation  |
| A mutation affects server-rendered cached widgets   | Server invalidation plus deliberate UI refresh |
| A result enables a truly dependent second request   | Explicit dependency; assess the waterfall      |
| Several features participate in one product command | Workflow feature with a semantic operation     |

Passing the same typed input to several widgets is composition, not duplicated
state. Copying that input into multiple stores or effects creates competing
owners.

## Own confirmed view state in the URL

- Parse, validate, normalize, and default the complete route-view contract
  before data operations or query keys use it.
- Centralize semantic changes such as `setQuery`, `toggleFilter`, `setSort`,
  `goToPage`, and `clearSearch`. Each operation owns dependent resets.
- Update related parameters atomically. Changing a filter commonly resets the
  page in the same navigation; do not repair contradictory combinations later
  in an effect.
- Keep typing, debounce, drag, hover, and incomplete form drafts local until
  they become confirmed navigation state.
- Use history deliberately. Explicit view changes and pagination usually
  deserve `push`; high-frequency synchronization that should not create a Back
  stack entry usually deserves `replace`.
- Treat Back and Forward as first-class inputs. Widgets re-derive their view
  from the URL rather than preserving a conflicting store copy.
- Pass normalized values into cached operations. Never key a cache with raw,
  unvalidated search parameters.

The route owns the request contract semantically. A feature may provide the
parser and navigation operations when it owns the view vocabulary, but the
page remains the boundary that receives request inputs and composes widgets.

## Keep local interaction local

Use local component state for values such as:

- an uncommitted search draft;
- whether a feature-local popover is open;
- hover, focus, disclosure, and animation state;
- a field-level validation message before submission.

Lift local state only when another component must participate in the same
lifecycle. Do not move it to the URL merely because two components display it,
and do not move it to a store merely to avoid passing one intentional prop.

## Use TanStack Query for a browser server-data lifecycle

Use the installed TanStack Query version only when the browser needs behavior
such as polling, refetching after focus, optimistic feedback shared across
widgets, client navigation reuse, or offline-aware caching.

- Define feature-owned query option or key factories. Include every normalized
  variable that changes the result, including entity, filters, pagination,
  locale, authorization scope, user, or tenant as appropriate.
- Keep freshness policy with the query contract. Avoid one broad application
  `staleTime` that silently assigns the same lifecycle to unrelated data.
- Give the browser query a browser-safe fetcher. It may call a Route Handler
  that delegates to the feature's server operation; it must not import a
  `server-only` operation into the client graph.
- Prefetch and hydrate only queries that benefit a client cache consumer. A
  Server Component with no browser freshness need can call its server operation
  directly.
- Create request-scoped query clients during server prefetch. Never share one
  cache instance across requests or tenants.
- Start known independent queries in parallel. Dependent queries are real
  waterfalls; preserve them only when the second input cannot exist earlier,
  or redesign the server operation or API to flatten them.
- Let mutations update known cache entries when the returned result is
  sufficient. Invalidate only the affected key families when a refetch is the
  safer reconciliation contract.
- Do not copy query results into Zustand for general access. Derive views with
  query selectors or pass the entity identity to widgets that need it.

## Use scoped Zustand for shared transient workflows

Use Zustand when several client islands need high-frequency or independently
selected access to one transient workflow that does not belong in the URL or
server cache.

- Create a vanilla store per provider instance and place the provider at the
  smallest common feature boundary. Do not create a module-global store in a
  server-rendered Next.js application.
- Keep React Server Components outside the store lifecycle. They may provide
  serializable initialization data to a Client Component provider but must not
  read or mutate the client store.
- Expose semantic actions and focused selectors. Keep raw `setState`, storage,
  and reconciliation mechanics private.
- Store only the workflow state the provider owns. Do not mirror URL params,
  query data, authentication claims, or server entities without an explicit
  working-copy contract.
- Initialize server and client renders from the same serializable state when
  the initial UI depends on store values.
- Key or reset a scoped store when the workflow identity changes and retaining
  the previous instance would be incorrect.

Examples include a comparison tray shared by dashboard widgets, multi-panel
selection that is intentionally not navigable, and an editor working copy with
undo history.

## Model optimistic state and reconciliation

- Name the authoritative server result, the optimistic projection, and the
  event that reconciles them.
- Cancel or account for in-flight reads that could overwrite an optimistic
  change with older data.
- Record enough previous state to roll back every affected cache entry or
  working-copy field on failure.
- Define which queries are updated directly, which are invalidated, and which
  widgets show the mutation error.
- Name server-render cache invalidation separately and define how the current
  route or region observes it. A QueryClient cannot refresh data owned only by
  a Server Component.
- Treat partial success and concurrent server revisions as domain outcomes,
  not generic toast-only failures.
- Keep unsaved editor state separate from optimistic server-cache state. A
  long-lived working copy needs base revision, dirty, save, conflict, and reset
  semantics rather than a mutation callback alone.

## Persist only with a durability contract

Cookie or browser-storage persistence introduces another timeline.

- Cookie `.set` / `.delete` only in a Server Function or Route Handler, never
  during RSC render.
- State whether persistence is a preference, crash-recovery aid, or durable
  product record.
- Version the stored shape and define migration or discard behavior.
- Prevent browser-only values from changing the initial render before
  hydration is ready.
- Never let stale local recovery data silently overwrite a newer server
  revision.
- Define logout, tenant change, expiry, and sensitive-data clearing behavior.

## Introduce orchestration only for active behavior

The page may pass one route contract to several independent features without
owning an orchestration feature. Add an explicit workflow owner when a product
command coordinates participants, state transitions, retries, or compensation
across feature boundaries.

Expose semantic workflow operations. Do not let participant features import
one another, and do not put cross-feature behavior in the page, a shared utility
folder, or a global store.

## Escalate specialized synchronization

Realtime subscriptions, collaborative editing, offline mutation queues,
multi-tab coordination, and CRDT or operational-transform systems add ordering,
identity, replay, and conflict contracts that this state split does not solve.
Treat them as separate architecture work. Do not represent them as a larger
Zustand store or a few more query invalidations.

## Apply the matching scenario

- [examples/search-page.md](examples/search-page.md) applies URL ownership to
  search, filters, sorting, pagination, and history.
- [examples/operations-dashboard.md](examples/operations-dashboard.md) combines
  Server Components, hydrated queries, multi-key mutations, and scoped Zustand.
- [examples/editor-workflow.md](examples/editor-workflow.md) defines an unsaved
  working copy, autosave, conflicts, and recovery persistence.
- [examples/master-detail-workspace.md](examples/master-detail-workspace.md)
  uses route identity for selection and modal-versus-page rendering.
