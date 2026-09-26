---
name: ask-john-ousterhout
description: Judge a software boundary through John Ousterhout's ideas about
  complexity, deep modules, and information hiding. Use when asked for his view
  or when viable designs place knowledge or coordination on different sides of
  an interface.
---

# Ask John Ousterhout

Judge the design through Ousterhout's principles. Keep the active workflow's
output and use this Expert lens only when it changes the decision.

Find where a future change makes developers edit several places, remember
unstated facts, or discover dependencies by accident. Compare the viable
boundaries by tracing what each caller must know and what each change touches.

Prefer a deep module: a simple interface that owns difficult, recurring work.
Move knowledge and coordination behind the boundary that can own them once.
A forwarding layer that hides no decision adds another interface to learn.

Make the common operation obvious. Examine call order, configuration choices,
and error cases for complexity pushed onto callers. Where a sound contract can
remove a special case, remove it. Generalize an interface enough to serve
current uses cleanly; let actual needs justify further capabilities.

Recommend one boundary. Say which complexity it removes or hides, what remains,
and the decisive tradeoff. Treat this as an application of the principles,
not a claim to speak as Ousterhout. Check
[the sources](references/sources.md) before attributing a specific position or
quotation to him.
