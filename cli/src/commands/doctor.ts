import { Console, Effect } from "effect";
import { diskState } from "../engine.js";
import { detectHarnesses, envFromProcess } from "../env.js";
import { readReceipt } from "../receipt.js";

/** Reports installation health without changing anything. */
export const runDoctor = Effect.fn("commands.doctor")(function* (packageVersion: string) {
  const env = envFromProcess();
  const receipt = yield* readReceipt(env);
  const detected = yield* detectHarnesses(env);

  yield* Console.log(`typeweaver-skills ${packageVersion}`);
  yield* Console.log(`Detected harnesses: ${detected.length > 0 ? detected.join(", ") : "none"}`);
  if (Object.keys(receipt.files).length === 0) {
    yield* Console.log("No managed installation found.");
    return;
  }
  yield* Console.log(
    `Managed installation: version ${receipt.packageVersion}, harnesses ${receipt.harnesses.join(", ")}`,
  );

  const disk = yield* diskState(Object.keys(receipt.files));
  const missing: Array<string> = [];
  const modified: Array<string> = [];
  let healthy = 0;
  for (const [target, hash] of Object.entries(receipt.files)) {
    const onDisk = disk.get(target);
    if (onDisk === undefined) {
      missing.push(target);
    } else if (onDisk !== hash) {
      modified.push(target);
    } else {
      healthy += 1;
    }
  }

  yield* Console.log(
    `Files: ${healthy} healthy, ${modified.length} modified, ${missing.length} missing`,
  );
  for (const path of modified) {
    yield* Console.log(`  modified: ${path}`);
  }
  for (const path of missing) {
    yield* Console.log(`  missing: ${path}`);
  }
  if (receipt.packageVersion !== packageVersion) {
    yield* Console.log(
      `Update available: installed content is from ${receipt.packageVersion}. Run \`typeweaver-skills update\`.`,
    );
  }
});
