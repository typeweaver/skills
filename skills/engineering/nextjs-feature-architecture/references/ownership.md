# Ownership Vocabulary and Responsibilities

Step 1 of the procedure. This file defines the terms the heuristic in
`SKILL.md` produces and states what each owner is responsible for.

## Vocabulary

- A **feature** owns application behavior or a user capability. It may be
  behavior-only, exposing operations or hooks and no widget.
- A **widget** is an independently composable UI region exposed by a feature,
  with its own data requirements and UX lifecycle. It is not another
  architecture layer: a feature may expose several widgets, and a widget does
  not require its own directory.
- **Shared UI** owns reusable visual and interaction primitives without feature
  behavior or authoritative product state.
- A **shared product component** composes shared UI for several features but
  owns neither application behavior nor authoritative state. It may read
  product context; it never owns or mutates it.
- **Shell regions** such as header, navigation, and footer belong to `app` or a
  layout, not to a feature.
- A **domain or platform module** owns reusable headless policy, data access,
  or infrastructure capability below feature operations. It exposes narrow
  contracts and does not depend on route-facing features.

## Choose feature boundaries

Choose feature boundaries by the knowledge and changes they contain, not by
screen rectangles. Keep behavior together when policy, state, failure, and
lifecycle change together.

Split when product policy, authorization, freshness, or consumers change on
different schedules, and each side is left with an interface its callers can
use without knowing the other side's data model. The tell that the split is in
the wrong place: one side must accept and pass through values it never reads.

Team or deployment boundaries are additional evidence, not the sole reason for
a feature.

## Own the request contract

- Treat `params`, `searchParams`, cookies, headers, locale, and other request
  inputs as boundary data. The route owns their contract semantically but need
  not resolve every value eagerly at the top of the tree.
- Resolve request-time values at the narrowest boundary that needs them. Parse,
  validate, normalize, and default each value there before feature behavior
  uses it. Do not await `params`, `searchParams`, `cookies()`, or `headers()`
  at the page top when the route has a static shell to protect; a fully dynamic
  route may resolve them at the top. A Suspense fallback that cannot render on
  first load is decoration: move the await below the boundary or remove the
  boundary.
- Verify identity and authorization on the server; never trust client-provided
  claims merely because route inputs were parsed.
- Pass normalized request values into cached or otherwise reusable work.

## Own composition

- Keep in a layout only what stays mounted and unchanged across every child
  route of the segment: the document or segment shell, shared providers,
  navigation, and persistent presentation. If a value differs between two child
  routes, it belongs to the page. Do not move one page's widget composition or
  feature behavior into a layout.
- Keep pages as route composition roots: parse the route contract, compose
  public feature surfaces, own route-level layout, and place loading and error
  boundaries. Prefer one feature root for a page that presents one capability;
  let that root hide its widget decomposition, data access, and internal
  layout. Export an individual widget only when a named external compositor
  needs it, such as a page interleaving independent features, a layout or
  parallel route, or another route that consumes a subset.
- Keep feature UI, contracts, feature operations, and Server Functions
  together. Create subdirectories only as responsibilities emerge.

## Own cross-feature behavior

- Give a workflow an explicit orchestration owner when one product command
  changes state in two or more features, or when a failure in one participant
  must roll back or compensate another. Two features reading the same route
  contract is not a workflow. The orchestrator depends on public participant
  operations or injected ports; participants do not import one another. Pass a
  workflow command into participant UI when it must emit an intent, rather than
  creating a reverse import. Do not hide cross-feature behavior in a
  participant or a generic shared folder.
- Move product-aware code to a shared product component when two or more
  features already import it and no feature's name would describe it. One
  importer plus an expected second is not two.
- Let a feature operation own its use case and orchestration. Reuse central
  authorization, domain policy, data access, telemetry, and vendor adapters
  through headless domain or platform modules when those concerns span
  features. Recheck authorization at every trusted entry point; centralizing
  policy does not make callers trusted.
