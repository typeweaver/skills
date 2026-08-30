# Search and Discovery Page

Use this scenario for a page with a search field, filter sidebar, sorting,
paginated results, and browser-history requirements. Its central lesson is that
confirmed view state belongs to one normalized URL contract; widgets do not
need a shared store merely because they respond to the same inputs.

Read [../state-coordination.md](../state-coordination.md) first for the general
state rules.

## Shape the feature

Start from a composition root. Split widgets only when their lifecycles
diverge; do not add `index.ts` until a second route composes a subset.

```text
app/search/page.tsx
features/search/search.tsx
features/search/search-view.ts
features/search/search-navigation.client.ts
features/search/search-content.server.ts
features/search/search-view.test.ts
```

`Search` hides field, filters, results, pagination, and Suspense. There is no
`server.ts` or `client.ts` until an external consumer exists.

## Assign state

| Value                                   | Owner                           |
| --------------------------------------- | ------------------------------- |
| Confirmed query                         | URL `q`                         |
| Selected filters                        | Normalized URL parameters       |
| Sort order                              | URL `sort`                      |
| Current page                            | URL `page`                      |
| Text while the user is typing           | Local `SearchField` state       |
| Available filter options                | Server operation or cached data |
| Search results and total count          | Server operation                |
| Optional browser-refreshed result cache | TanStack Query, when justified  |
| Sidebar disclosure on a narrow viewport | Local `FilterSidebar` state     |

Parse `searchParams` into `SearchView` at the narrowest boundary that needs
the view. On Next.js 15+ `searchParams` is a Promise; with Cache Components,
awaiting it at the page top without Suspense blocks the static shell. Keep URL
ownership in the route contract, but resolve the promise inside `Search` (or
the results boundary), then validate enums, deduplicate filters, apply
defaults, and clamp pagination before data access.

## Keep navigation semantic

Centralize URL changes as operations rather than allowing widgets to mutate
arbitrary keys:

```text
commitQuery(query)       -> set q, reset page
toggleFilter(filter)     -> update filters, reset page
setSort(sort)            -> set sort, reset page
goToPage(page)           -> update page only
clearSearch()            -> remove q, filters, sort, and page coherently
```

- Apply dependent changes in one navigation. Never render page 12 with a new
  filter and repair it to page 1 in an effect.
- Use a form or explicit submit when search is a committed action. If a
  debounced experience is required, keep the draft local and use `replace` for
  intermediate confirmed updates that should not flood browser history.
- Use links or `push` for pagination and explicit view changes when Back should
  restore the previous result set.
- Reconcile the local input draft when Back, Forward, or an external navigation
  changes the confirmed query. Keying the input boundary by confirmed identity
  is often clearer than continuously mirroring URL state in an effect.

## Compose without page behavior

```text
SearchPage
└── Search                    // awaits searchParams, parses SearchView
    ├── SearchField(query)
    ├── FilterSidebar(filters, sort)
    └── Suspense
        └── SearchResultsPane(SearchView)
            ├── SearchResults
            └── SearchPagination(total from the same operation)
```

The page renders `Search`. Do not await the search on the page to feed
pagination as a sibling of `Suspense(SearchResults)` — `total` comes from the
same operation as the results, so that pattern serializes the shell.

- `SearchField` owns the typing draft and commits semantic navigation.
- `FilterSidebar` renders controlled filter state from `SearchView`.
- `SearchResultsPane` is a Server Component and calls
  `search-content.server.ts` with the normalized view.

If the filter options and results are independent, start them independently.
If result rendering needs the filter metadata, decide whether that dependency
is real domain ordering or an avoidable request waterfall.

## Add TanStack Query only for a browser lifecycle

Keep server-rendered results when navigation is sufficient. Introduce TanStack
Query only when the results need browser polling, background refetch, infinite
loading, offline-aware reuse, or optimistic changes shared by client widgets.

When introduced:

- derive the query key exclusively from normalized `SearchView` plus tenant,
  locale, or authorization scope when they change the result;
- prefetch and hydrate the matching key when server-rendered initial results
  materially improve the experience;
- keep page-number pagination and infinite pagination as different contracts;
- never copy query results into Zustand to make them available to the sidebar;
- keep result freshness and invalidation policy with the feature query options.

## Handle hard cases

- **Invalid URLs:** Return a normalized safe view or redirect to a canonical URL
  when canonicalization has product value. Avoid redirect loops.
- **Empty queries:** Define whether they show discovery content, recent items,
  or an empty state; do not let the data layer decide accidentally.
- **Filter counts:** If counts depend on the other active filters, include the
  same normalized view in their data identity and start independent work in
  parallel where possible.
- **Tenant isolation:** Include the authoritative tenant or principal in server
  authorization and every cache identity that can cross users.
- **Rapid navigation:** Ensure stale responses cannot replace a newer URL view.
  Server navigation identity or query keys should make this ordering explicit.
- **Pagination bounds:** Treat a page beyond the last result as an expected
  outcome with a defined canonicalization or empty-state contract.

## Avoid

- One global store containing query, filters, page, and results.
- Independent `useSearchParams` parsing rules in every widget.
- A Context that mirrors the URL so widgets can avoid accepting `SearchView`.
- Query keys built from raw `URLSearchParams` or omitted filter variables.
- Resetting pagination after render with an effect.
- A public `client.ts` or `server.ts` created only to make the tree symmetric.

## Verify

- Parser tests cover defaults, invalid values, duplicates, canonical ordering,
  and dependent resets.
- Navigation tests cover submit, filter, sort, pagination, clear, Back, Forward,
  refresh, and copied URLs.
- Integration tests prove every widget renders the same confirmed view and
  stale results cannot win a navigation race.
- Cache tests prove complete query identity and tenant isolation when caching
  is present.
