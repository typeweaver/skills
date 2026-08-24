import { Effect, FileSystem, PlatformError } from "effect";
import { dirname, join } from "node:path";
import type { Env, Receipt } from "./domain.js";
import { emptyReceipt } from "./domain.js";

export const receiptPath = (env: Env): string =>
  join(env.configHome, "typeweaver-skills", "receipt.json");

export const readReceipt = (env: Env): Effect.Effect<Receipt, never, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const raw = yield* fs.readFileString(receiptPath(env));
    return JSON.parse(raw) as Receipt;
  }).pipe(Effect.orElseSucceed(() => emptyReceipt));

export const writeReceipt = (
  env: Env,
  receipt: Receipt,
): Effect.Effect<void, PlatformError.PlatformError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    yield* fs.makeDirectory(dirname(receiptPath(env)), { recursive: true });
    yield* fs.writeFileString(receiptPath(env), `${JSON.stringify(receipt, null, 2)}\n`);
  });

export const removeReceipt = (
  env: Env,
): Effect.Effect<void, PlatformError.PlatformError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    yield* fs.remove(receiptPath(env));
  });
