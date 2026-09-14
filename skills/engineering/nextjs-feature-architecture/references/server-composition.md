# Server Composition and Mutation Transport

Step 4 of the procedure.

- Start with Server Components. Introduce a Client Component only for browser
  APIs, effects, local interaction, event handlers, high-frequency updates, or
  optimistic feedback.
- Keep `"use client"` boundaries close to the interaction because every import
  below that boundary enters the client module graph.
- Let a server-rendered widget own what data it needs; let a feature operation
  own how that data is obtained.
- Start two server reads in sequence only when the second takes an input the
  first returns. Awaiting both in one Server Component without that input
  dependency serializes the page shell.
- Mutate through Server Functions by default; they run on the server, return
  updated UI in one round trip, and are dispatched one at a time. Keep an
  existing Route Handler transport for mutations when a browser query cache
  owns reconciliation and the repository has one HTTP error contract. Use Route
  Handlers for webhooks, callbacks, non-HTML responses, and external consumers.
- Read server data by calling the feature operation from a Server Component. Do
  not read through a Server Function, and do not fetch a Route Handler from a
  Server Component.
- Validate and authorize inside every trusted mutation boundary, then make
  invalidation or refresh behavior explicit.
- Use a link for navigation and a form for submission unless the interaction
  needs a value the server cannot render: a browser API, a keystroke-level
  response, or optimistic feedback.
- Test route parsing and feature operations directly; test navigation,
  mutation, and cache wiring at their integration boundaries.
