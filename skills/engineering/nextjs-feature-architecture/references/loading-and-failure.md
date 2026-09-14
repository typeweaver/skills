# Loading, Empty, and Failure Behavior

Use this reference in step 5 of the procedure.

- Place Suspense around regions that can meaningfully load, stream, reveal, or
  refresh independently. Use route-level loading files when the whole segment
  shares that lifecycle.
- Keep a widget-shaped skeleton or fallback with the feature that owns the
  widget. Let the page place or compose that fallback; do not duplicate feature
  geometry in a route-level loading file unless the whole segment deliberately
  owns one coordinated shell.
- Match each fallback to the visual shape it replaces. Reset a boundary with a
  key only when the content identity truly changed.
- Model empty results, validation failures, denied access, rejected mutations,
  and known dependency failures as expected outcomes. Use `notFound()`,
  `redirect()`, and the repository's forbidden/unauthorized helpers at those
  boundaries.
- Reserve error boundaries and route error handling for unexpected failures.
  Define loading, empty, expected-failure, and unexpected-failure behavior
  before declaring the feature complete.
