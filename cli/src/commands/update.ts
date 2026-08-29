import { Effect } from "effect";
import { updateLifecycle } from "../update-lifecycle.js";
import { commandError, renderActionReport } from "./report.js";

export type UpdateOptions = {
  readonly force: boolean;
  readonly dryRun: boolean;
};

export const runUpdate = Effect.fn("commands.update")(function* (
  packageVersion: string,
  options: UpdateOptions,
) {
  const report = yield* Effect.try({
    try: () => updateLifecycle(options, packageVersion),
    catch: commandError,
  });
  yield* renderActionReport("Update", report);
  return report;
});
