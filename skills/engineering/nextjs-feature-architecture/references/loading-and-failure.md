# Loading, Empty, and Failure Behavior

Step 5 of the procedure.

- Place Suspense around a region that has its own data read and can render
  before or after its siblings. A boundary around a region with no independent
  read only adds a fallback. Use route-level loading files when the whole
  segment shares one lifecycle.
- Keep a widget-shaped skeleton or fallback with the feature that owns the
  widget. Let the page place or compose that fallback; do not duplicate feature
  geometry in a route-level loading file unless every widget in the segment
  shares one skeleton the page owns.
- Match each fallback to the visual shape it replaces.
- Reset a boundary with a key only when the new content has a different
  identity, such as a different entity id or route param. Do not key on a value
  that changes only the same entity's presentation.
- Model empty results, validation failures, denied access, rejected mutations,
  and known dependency failures as expected outcomes. Use `notFound()`,
  `redirect()`, and the repository's forbidden and unauthorized helpers at those
  boundaries.
- Reserve error boundaries and route error handling for unexpected failures.
