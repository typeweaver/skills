import { Console, Effect } from "effect";
import { contentRoot, desiredFiles, indexContent } from "../content.js";
import type { Harness } from "../domain.js";
import { diskState, removeOrphans, writePlannedFiles } from "../engine.js";
import { envFromProcess } from "../env.js";
import { nextReceiptFiles, planInstall, planOrphans } from "../planner.js";
import { readReceipt, writeReceipt } from "../receipt.js";

export interface InstallSelection {
  readonly harnesses: ReadonlyArray<Harness>;
  /** Empty means: everything the package contains. */
  readonly skills: ReadonlyArray<string>;
  readonly agents: ReadonlyArray<string>;
  readonly dryRun: boolean;
}

export interface RunReport {
  readonly created: number;
  readonly updated: number;
  readonly unchanged: number;
  readonly preserved: ReadonlyArray<string>;
  readonly removed: number;
}

export const runInstall = Effect.fn("commands.install")(function* (
  selection: InstallSelection,
  packageVersion: string,
) {
  const env = envFromProcess();
  const root = contentRoot();
  const index = yield* indexContent(root);

  const skills =
    selection.skills.length > 0 ? selection.skills : Array.from(index.skills.keys()).sort();
  const agents =
    selection.agents.length > 0 ? selection.agents : Array.from(index.agents.keys()).sort();

  const desired = yield* desiredFiles(root, index, selection.harnesses, skills, agents, env);
  const desiredHashes = new Map(desired.map((file) => [file.target, file.hash]));
  const receipt = yield* readReceipt(env);
  const disk = yield* diskState(new Set([...desiredHashes.keys(), ...Object.keys(receipt.files)]));
  const plan = planInstall(desiredHashes, disk, receipt);
  const orphans = planOrphans(desiredHashes, disk, receipt);

  const report: RunReport = {
    created: plan.actions.filter((a) => a._tag === "Create").length,
    updated: plan.actions.filter((a) => a._tag === "Update").length,
    unchanged: plan.actions.filter((a) => a._tag === "Unchanged").length,
    preserved: [...plan.actions, ...orphans]
      .filter((a) => a._tag === "PreserveUserFile")
      .map((a) => a.target),
    removed: orphans.filter((a) => a._tag === "RemoveOrphan").length,
  };

  if (!selection.dryRun) {
    yield* writePlannedFiles(plan, desired);
    yield* removeOrphans(orphans, env);
    yield* writeReceipt(env, {
      packageVersion,
      harnesses: selection.harnesses,
      files: nextReceiptFiles(desiredHashes, plan, receipt),
    });
  }

  yield* Console.log("");
  yield* Console.log(selection.dryRun ? "Planned (dry run):" : "Installed:");
  yield* Console.log(
    `  ${skills.length} skills, ${agents.length} agents -> ${selection.harnesses.join(", ")}`,
  );
  yield* Console.log(
    `  ${report.created} created, ${report.updated} updated, ${report.unchanged} unchanged, ${report.removed} removed`,
  );
  for (const path of report.preserved) {
    yield* Console.log(`  preserved user file: ${path}`);
  }
  yield* Console.log("");
  return report;
});
