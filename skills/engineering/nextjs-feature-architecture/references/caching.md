# Cache Contracts and Invalidation

Step 6 of the procedure.

- Treat caching as part of each feature operation's data contract, not as an
  incidental optimization. Keep the policy next to the operation and define
  what is cached, what identifies the cache entry, how long it may be stale,
  what invalidates it, who owns that invalidation, and how users or tenants
  remain isolated.
- A server-render cache and a browser query cache are separate
  representations. `queryClient.invalidateQueries` cannot refresh a Server
  Component.
- Detect whether the repository uses Cache Components. Separate invalidating
  cached data from making the current UI observe it. With Cache Components, use
  `updateTag` in a Server Function for immediate read-your-own-writes,
  `revalidateTag(tag, "max")` for stale-while-revalidate, and `revalidatePath`
  when the path is the intended invalidation scope. `refresh()` refreshes the
  client router from a Server Function but does not invalidate cached data.
  Without Cache Components, `fetch` is uncached by default; use the
  repository's `unstable_cache`, `revalidateTag`, and `revalidatePath`
  primitives. Never assume historical `fetch` cache defaults still apply.
- Never set or delete cookies during render; HTTP forbids it once streaming
  starts. Persist server-trusted preferences in a Server Function or Route
  Handler. A browser-side cookie is acceptable for a non-sensitive preference
  that the server treats as untrusted input.
