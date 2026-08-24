import { Console, Effect } from "effect";
import { diskState, removeOrphans } from "../engine.js";
import { envFromProcess } from "../env.js";
import { NoReceiptError } from "../errors.js";
import { planOrphans } from "../planner.js";
import { readReceipt, removeReceipt } from "../receipt.js";

/** Removes exactly the files the receipt proves we created and left intact. */
export const runUninstall = Effect.fn("commands.uninstall")(function* () {
  const env = envFromProcess();
  const receipt = yield* readReceipt(env);
  if (Object.keys(receipt.files).length === 0) {
    yield* new NoReceiptError({
      message: "No managed installation found; nothing to uninstall.",
    });
  }

  const disk = yield* diskState(Object.keys(receipt.files));
  const orphans = planOrphans(new Map(), disk, receipt);
  const removed = yield* removeOrphans(orphans, env);
  yield* removeReceipt(env);

  yield* Console.log(`Removed ${removed.length} managed files.`);
  for (const keep of orphans.filter((a) => a._tag === "PreserveUserFile")) {
    yield* Console.log(`  preserved modified file: ${keep.target}`);
  }
});
