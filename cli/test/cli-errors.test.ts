import { assert, it } from "@effect/vitest";
import { Runtime } from "effect";
import { formatExpectedError, isExpectedError } from "../src/cli.js";
import { ConflictError, GeneratorDriftError, LifecycleError } from "../src/errors.js";

it("marks expected outcomes so the runtime does not log them", () => {
  const conflict = new ConflictError({ message: "Preflight found 1 conflict(s).", conflicts: [] });
  assert.strictEqual(Runtime.getErrorReported(conflict), false);
  assert.isTrue(isExpectedError(conflict));
  assert.isTrue(isExpectedError(new LifecycleError({ message: "boom" })));
});

it("does not treat defects as expected", () => {
  assert.isFalse(isExpectedError(new TypeError("Cannot read properties of undefined")));
  assert.isFalse(isExpectedError("string"));
  assert.isFalse(isExpectedError(null));
});

it("renders the message and any affected files without a stack trace", () => {
  const drift = new GeneratorDriftError({
    message: "Generated adapters are out of date.",
    files: ["agents/review-it/claude.md"],
  });
  assert.strictEqual(
    formatExpectedError(drift),
    "Generated adapters are out of date.\n  agents/review-it/claude.md",
  );
  assert.notInclude(formatExpectedError(drift), "    at ");
});
