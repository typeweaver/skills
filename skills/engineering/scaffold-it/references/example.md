# Scaffold example

A planned change to a to-do application: mark a to-do complete. The plan names
one owner and settles its contract. The repository uses TypeScript, Vitest, and
JSDoc. Translate the comment, pending-test, and not-implemented idiom to the
target repository.

## Owner: `src/todos/complete-todo.ts`

```ts
// @scaffold Owns: the complete transition of a to-do and the rules for when it applies.
// @scaffold Why: first state transition; reopen and archive will follow this shape.
// @scaffold Scale: one function per transition, persistence stays behind TodoStore.
import type { Todo, TodoId } from "./todo";
import type { TodoStore } from "./todo-store";

export type CompleteTodoResult =
  | { readonly kind: "completed"; readonly todo: Todo }
  | { readonly kind: "not-found" }
  | { readonly kind: "already-completed" };

/**
 * Marks the to-do complete at `now` and persists it.
 * Returns `not-found` for an unknown id and `already-completed` when the
 * to-do is already complete; neither persists anything.
 */
export async function completeTodo(
  store: TodoStore,
  id: TodoId,
  now: Date,
): Promise<CompleteTodoResult> {
  throw new Error("not implemented");
}
```

## Tests: `src/todos/complete-todo.test.ts`

Case names follow the repository's existing tests. The `->` form belongs to
the report, not to the code.

```ts
import { describe, test } from "vitest";

describe("completeTodo", () => {
  test.todo("marks an open to-do complete at the given time and persists it");
  test.todo("returns not-found for an unknown id and persists nothing");
  test.todo("returns already-completed and keeps the original completion time");
});
```

## Changed: `src/todos/index.ts`

One added line exporting `completeTodo` and `CompleteTodoResult`. No runtime
path calls the new function.

## Report

```text
Scaffold for: mark a to-do complete (plan step 2)

src/todos/
├── complete-todo.ts        owns the complete transition; imports Todo, TodoId, TodoStore
├── complete-todo.test.ts   3 pending cases
└── index.ts                changed: exports completeTodo, CompleteTodoResult

Tests
complete-todo.test.ts
- open to-do, now -> completed, todo.completedAt = now, persisted
- unknown id -> not-found, nothing persisted
- already completed to-do -> already-completed, completedAt unchanged

Open decisions: none
Checks: pnpm check -> green (typecheck, lint, 3 pending tests)
```
