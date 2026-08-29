import { Effect } from "effect";
import type { ContentSelection, Harness } from "../domain.js";
import { uninstallLifecycle } from "../uninstall-lifecycle.js";
import { commandError, renderActionReport } from "./report.js";

export type UninstallOptions = {
  readonly force: boolean;
  readonly dryRun: boolean;
  readonly harnesses?: ReadonlyArray<Harness>;
  readonly skills?: ContentSelection;
  readonly agents?: ContentSelection;
};

export const runUninstall = Effect.fn("commands.uninstall")(function* (
  packageVersion: string,
  options: UninstallOptions,
) {
  const report = yield* Effect.try({
    try: () => uninstallLifecycle(options, packageVersion),
    catch: commandError,
  });
  yield* renderActionReport("Uninstall", report);
  return report;
});
