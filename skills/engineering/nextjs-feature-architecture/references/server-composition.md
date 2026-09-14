# Server Composition and Mutation Transport

Use this reference in step 4 of the procedure.

- Start with Server Components. Introduce a Client Component only for browser
  APIs, effects, local interaction, event handlers, high-frequency updates, or
  optimistic feedback.
- Keep `"use client"` boundaries close to the interaction because every import
  below that boundary enters the client module graph.
- Let a server-rendered widget own what data it needs; let a feature operation
  own how that data is obtained.
- Start independent work independently. Keep sequential work only when one
  result truly depends on another.
- Mutate through Server Functions by default; they run on the server, return
  updated UI in one round trip, and are dispatched one at a time. Keep an
  existing Route Handler transport for mutations when a client query cache
  owns reconciliation and the repository has one HTTP error contract. Use Route
  Handlers for webhooks, callbacks, non-HTML responses, and external
  consumers. Never read through Server Actions, and never fetch from a Route
  Handler inside a Server Component.
- Validate and authorize inside every trusted mutation boundary, then make
  invalidation or refresh behavior explicit.
- Prefer links and forms for navigation and form-like interactions when they
  provide a useful baseline; add client behavior for material UX improvements.
