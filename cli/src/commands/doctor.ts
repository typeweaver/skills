import { Effect } from "effect";
import { doctorLifecycle } from "../doctor-lifecycle.js";
import { DoctorUnhealthyError } from "../errors.js";
import { renderDoctorReport } from "./report.js";

/** Reports installation health without changing or recovering anything. */
export const runDoctor = Effect.fn("commands.doctor")(function* (packageVersion: string) {
  const report = doctorLifecycle(packageVersion);
  yield* renderDoctorReport(report);
  if (report.issues.length > 0) {
    return yield* new DoctorUnhealthyError({
      message: `Installation is unhealthy (${report.issues.length} issue(s)).`,
    });
  }
  return report;
});
