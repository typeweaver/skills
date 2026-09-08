# Revise nextjs-feature-architecture from forward-test evidence

## Context

A clean-context forward test applied the skill as an assessment lens to a
real Next.js 16 app with nine features and an enforced boundary allowlist. The
skill produced five concrete, file-level improvements and earned its place, but
the tester had to invent conclusions the skill should state, and two of the
most useful rules live only in a reference. All claims below were verified
against current Next.js, nuqs, zustand, and TanStack Query documentation.

## Goal

The skill states the missing rules, has an output contract for review and
assessment tasks, keeps one source per rule, and is shorter than today.

## Acceptance criteria

- Shallow-routing rule: URL changes made without a server round trip (nuqs
  default, `history.*`) do not re-render Server Components; URL-driven peer
  composition then belongs to a page-owned Client compositor, or the update
  must notify the server.
- Mutation-transport criteria replace the current sentence: Server Functions
  by default; an existing HTTP transport is acceptable when a client query
  cache owns reconciliation and one error contract exists; never fetch through
  Route Handlers from Server Components; Server Actions are queued.
- Cookie rule: never set or delete during render; server-trusted preferences in
  a Server Function or Route Handler; a browser-side cookie is acceptable for a
  non-sensitive preference the server treats as untrusted input.
- Static-shell rule extended to `cookies()` and `headers()`, plus: a Suspense
  fallback that can never render on first load is theatrical.
- Vocabulary names behavior-only features and app-owned shell regions; shared
  product components may read product context, never own or mutate it.
- Promoted into `SKILL.md`: provider-scoped client stores (no module-global
  stores in a server-rendered app) and per-query freshness on top of a
  non-zero default `staleTime`; removed from the reference.
- Review/assessment output contract: findings per invariant with file
  evidence, the owner that should exist, and a repayment trigger; no
  restructuring.
- Compression: "Verify the result" checklist removed, conditional-guidance
  section collapsed, filename conventions in references replaced by runtime
  markers; `SKILL.md` shorter than 295 lines.
- A second clean-context assessment reaches the shallow-routing and
  mutation-transport conclusions by citing the skill.

## References

- `skills/engineering/nextjs-feature-architecture/`
- https://nextjs.org/docs/app/getting-started/mutating-data
- https://nextjs.org/docs/app/api-reference/functions/cookies
- https://nuqs.dev/docs/options
