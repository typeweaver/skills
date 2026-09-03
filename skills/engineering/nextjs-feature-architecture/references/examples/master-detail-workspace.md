# Master-Detail Workspace

Use this scenario when a collection remains visible while a selected item
opens as a modal during in-app navigation and as a full page after direct
navigation or refresh. It demonstrates route-owned selection, separate feature
interfaces, and App Router composition without a global `selectedItem` store.

Read [../state-coordination.md](../state-coordination.md) first.

## Let routing express navigable selection

```text
app/items/layout.tsx
app/items/page.tsx
app/items/[itemId]/page.tsx
app/items/@detail/default.tsx
app/items/@detail/(.)[itemId]/page.tsx
app/items/@detail/[...catchAll]/page.tsx
features/item-browser/item-browser.tsx
features/item-detail/item-detail.tsx
features/item-detail/get-item-detail.server.ts
features/item-detail/update-item.server.ts
features/item-detail/update-item.action.ts
features/item-detail/item-detail-dialog.client.tsx
```

Treat folder syntax as version-sensitive. The contract is:

- `ItemsLayout({ children, detail })` renders both slots side by side.
- `default.tsx` and the catch-all return `null` when no detail route is active.
- the canonical `[itemId]` page renders `ItemDetail` after direct navigation.
- the intercepting `@detail` slot renders `ItemDetailDialog` wrapping the same
  `ItemDetail` during soft navigation.
- close is navigation (`router.back()` or a link that matches the null slot).
- the dialog imports `update-item.action.ts`, not `update-item.server.ts`.

Do not encode `selectedItemId` and `isDetailModalOpen` as independent global
state. They are representations of navigation.

## Keep feature ownership separate

`item-browser` owns collection filters, results, pagination, and selection
links. `item-detail` owns loading, authorization, mutations, expected outcomes,
and detail presentation for one item.

Each feature exposes a composition root. Route files compose those roots;
neither feature imports the other's internals. No workflow feature is needed
because the route passively coordinates the two capabilities.

If selecting an item starts a non-navigable multi-step workflow that actively
commands both features, add an explicit workflow owner. Do not hide that new
behavior in the route slot or a generic modal provider.

## Assign state

| Value                                     | Owner                                     |
| ----------------------------------------- | ----------------------------------------- |
| Selected item                             | Canonical route param                     |
| Confirmed list filters, sort, and page    | Normalized URL search params              |
| List results                              | Server operation or browser query cache   |
| Authoritative item detail                 | Server operation or browser query cache   |
| Whether navigation presents modal or page | Router composition and navigation context |
| Dialog focus, disclosure, and animation   | Local dialog state                        |
| Unsaved detail form fields                | Local form or scoped edit workflow        |
| Optimistic item update                    | Mutation lifecycle or query cache         |

The same selected item identity must authorize and cache consistently in the
modal and full-page renderings. Presentation context does not create a second
entity identity.

## Compose one capability in two presentations

The canonical detail page and intercepted dialog should reuse the public
`ItemDetail` capability:

```text
ItemsLayout({ children, detail })
├── children: ItemBrowser | ItemDetailPage
└── detail: null | ItemDetailDialog(ItemDetail)

Direct navigation or refresh
└── ItemDetailPage
    └── ItemDetail(itemId)

Soft navigation from collection
└── detail slot
    └── ItemDetailDialog
        └── ItemDetail(itemId)
```

Keep dialog chrome, focus management, close affordance, and animation in the
client dialog wrapper. Keep detail loading, authorization, domain mutations,
empty outcomes, and expected failures in `item-detail` so both presentations
behave consistently.

Close semantics are navigation semantics. Usually the dialog closes by
returning to the previous collection view, but define a safe fallback when
there is no appropriate history entry. Preserve the collection's normalized
filters and pagination when returning.

## Coordinate data and mutations

Server-render detail by default. Introduce TanStack Query when the detail or
list genuinely needs browser polling, optimistic mutation, focus refetch, or
cache reuse across soft navigation.

When a detail mutation also changes a list row:

- give list and detail queries complete, tenant-safe identities;
- update both exact projections from a complete mutation result, or invalidate
  only their affected key families;
- record and roll back every optimistic projection together;
- ensure a background list response cannot restore stale item data;
- keep the modal and full page on the same entity and invalidation contracts.

Do not copy the selected entity into a navigation store to coordinate cache
updates. Use route identity and feature query contracts.

## Place loading and failure boundaries deliberately

- Let the collection stay useful while detail loads or fails.
- Give the detail slot a detail-shaped fallback and expected not-found, denied,
  deleted, and mutation-failure outcomes.
- Keep canonical-page behavior correct without assuming the collection is
  mounted behind it.
- Define what the slot renders after reload, unmatched navigation, and close.
- Recheck authorization independently for every detail read and mutation; the
  list having shown an item is not authorization proof.

## Handle hard cases

- **Refresh while open:** The canonical item route must render a useful full
  page even when interception context is gone.
- **Back and Forward:** Browser history should restore both collection view and
  selected detail without a competing store copy.
- **Deep links:** Copied item URLs must work without a previously rendered
  collection or client cache.
- **Deleted item:** Define the list correction, detail outcome, close path, and
  cache invalidation together.
- **Mobile presentation:** A narrow viewport may navigate to the canonical full
  page while desktop intercepts into a dialog; identity and behavior remain the
  same.
- **Accessibility:** Manage focus entry, focus restoration, dialog semantics,
  escape behavior, scroll containment, and background interaction explicitly.
- **Nested navigation:** Decide which detail subroutes remain inside the dialog
  and which intentionally leave its presentation context.

## Avoid

- Global `selectedItemId` plus `isModalOpen` state that duplicates the route.
- Separate detail implementations for modal and full-page presentation.
- Treating the intercepted route as the canonical URL contract.
- Assuming a parallel slot always has active content after hard navigation.
- Authorizing detail access from data already exposed in the collection.
- Making the page own detail mutations because it places the modal.

## Verify

- Route tests cover soft navigation, direct navigation, refresh, Back,
  Forward, close, copied URLs, and unmatched slots.
- Integration tests prove filters and pagination survive opening and closing a
  detail.
- Feature tests prove modal and page presentations share authorization,
  expected outcomes, mutations, and cache identity.
- Mutation tests cover list/detail reconciliation, rollback, deletion, and
  stale in-flight responses.
- Accessibility tests cover focus, keyboard dismissal, restoration, and
  background isolation.
