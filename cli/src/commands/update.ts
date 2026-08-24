import { Effect } from "effect";
import { NoReceiptError } from "../errors.js";
import { envFromProcess } from "../env.js";
import { readReceipt } from "../receipt.js";
import { runInstall } from "./install.js";

/** Re-renders the previous installation from the current package version. */
export const runUpdate = Effect.fn("commands.update")(function* (packageVersion: string) {
  const env = envFromProcess();
  const receipt = yield* readReceipt(env);
  if (Object.keys(receipt.files).length === 0) {
    return yield* new NoReceiptError({
      message: "No managed installation found. Run `typeweaver-skills install` first.",
    });
  }
  return yield* runInstall(
    { harnesses: receipt.harnesses, skills: [], agents: [], dryRun: false },
    packageVersion,
  );
});
