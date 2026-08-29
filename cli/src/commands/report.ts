import { Console, Effect } from "effect";
import type { DoctorReport } from "../doctor-lifecycle.js";
import type { ActionReport } from "../lifecycle.js";
import { ConflictError, LifecycleError } from "../errors.js";

export const commandError = (error: unknown): ConflictError | LifecycleError => {
  if (error instanceof ConflictError) {
    return error;
  }
  return new LifecycleError({
    message: error instanceof Error ? error.message : String(error),
  });
};

export const renderActionReport = (verb: string, report: ActionReport) =>
  Effect.gen(function* () {
    const counts = new Map<string, number>();
    for (const action of report.actions) {
      counts.set(action.kind, (counts.get(action.kind) ?? 0) + 1);
    }
    yield* Console.log(report.dryRun ? `Planned ${verb} (dry run):` : `${verb}:`);
    yield* Console.log(`  ${report.componentCount} component(s)`);
    for (const kind of ["Create", "Adopt", "Keep", "Replace", "Remove"] as const) {
      const count = counts.get(kind) ?? 0;
      if (count > 0) {
        yield* Console.log(`  ${kind}: ${count}`);
      }
    }
    for (const action of report.actions) {
      yield* Console.log(`    ${action.kind} ${action.node.root}:${action.node.relativePath}`);
    }
    if (report.recovery !== "none") {
      yield* Console.log(`  recovered previous transaction: ${report.recovery}`);
    }
  });

export const renderDoctorReport = (report: DoctorReport) =>
  Effect.gen(function* () {
    yield* Console.log(`typeweaver-skills ${report.packageVersion}`);
    yield* Console.log(`Receipt: ${report.receiptState}`);
    if (report.installedVersion !== undefined) {
      yield* Console.log(`Installed package version: ${report.installedVersion}`);
    }
    yield* Console.log(`Components: ${report.components.length}`);
    for (const component of report.components) {
      const mode = component.kind === "skill" ? `, mode ${component.requestedMode}` : "";
      yield* Console.log(`  ${component.key}: ${component.consumers.join(", ")}${mode}`);
    }
    for (const issue of report.issues) {
      const location = issue.root === undefined ? "" : ` ${issue.root}:${issue.relativePath ?? ""}`;
      yield* Console.log(`  unhealthy:${location} ${issue.message}`);
    }
    if (report.issues.length === 0) {
      yield* Console.log("Installation is healthy.");
    }
  });
