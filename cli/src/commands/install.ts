import { Effect } from "effect";
import type { ContentSelection, Harness, SkillMode } from "../domain.js";
import { installLifecycle } from "../install-lifecycle.js";
import { commandError, renderActionReport } from "./report.js";

export type InstallSelection = {
  readonly harnesses: ReadonlyArray<Harness>;
  readonly skills: ContentSelection;
  readonly agents: ContentSelection;
  readonly mode: SkillMode;
  readonly force: boolean;
  readonly dryRun: boolean;
};

export const runInstall = Effect.fn("commands.install")(function* (
  selection: InstallSelection,
  packageVersion: string,
) {
  const report = yield* Effect.try({
    try: () => installLifecycle(selection, packageVersion),
    catch: commandError,
  });
  yield* renderActionReport("Install", report);
  return report;
});
