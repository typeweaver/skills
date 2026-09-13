# Scaffold annotation template

Adapt the syntax and omit fields that add no information. Prefix every temporary
line with `@scaffold`.

## Source module

```text
@scaffold Purpose: <why this module exists>
@scaffold Owns: <data, state, or behavior owned here>
@scaffold Provides: <caller-visible contracts>
@scaffold Depends on: <allowed owning modules or boundaries>
@scaffold Implement: <observable obligation without algorithmic instructions>
```

Use the repository's public documentation form for a real public contract. Keep
the `@scaffold` line beside it only for the implementation obligation that will
later disappear.

## Test intent

```text
@scaffold Tests:
@scaffold - <trigger or input> -> <observable result>
@scaffold - <failure or edge condition> -> <observable result>
```

When the test framework has a pending-test construct that keeps the suite green,
prefer one named pending case per bullet. In an existing test file, place cases
beside the suite that will own them. Never add a passing placeholder assertion.

## Worked example

This TypeScript example illustrates the shape only. Translate its comment and
declaration syntax to the target repository.

```ts
// @scaffold Purpose: Define the caller-visible account-suspension boundary.
// @scaffold Owns: Suspension requests and results.
// @scaffold Provides: SuspendAccountInput, SuspendAccountResult, and SuspendAccount.
// @scaffold Depends on: The existing AccountId type and AccountStore port.
// @scaffold Implement: Persist the suspension or return AccountNotFound.
export interface SuspendAccountInput {
  readonly accountId: AccountId;
  readonly reason: string;
}

export type SuspendAccountResult =
  { readonly _tag: "Suspended" } | { readonly _tag: "AccountNotFound" };

/** Resolves only after the store confirms durable persistence. */
export type SuspendAccount = (
  store: AccountStore,
  input: SuspendAccountInput,
) => Promise<SuspendAccountResult>;
```

```ts
// @scaffold Tests:
test.todo("an active account -> resolves after persistence and returns Suspended");
test.todo("an unknown account -> returns AccountNotFound");
```
