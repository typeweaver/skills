import type { PlatformError } from "effect";
import { Effect, FileSystem } from "effect";
import { dirname, join } from "node:path";
import type { Env, Harness, Receipt } from "./domain.js";
import { HARNESSES, emptyReceipt, isRecord } from "./domain.js";

export const receiptPath = (env: Env): string =>
  join(env.configHome, "typeweaver-skills", "receipt.json");

const parseReceipt = (raw: string): Receipt | undefined => {
  const value: unknown = JSON.parse(raw);
  if (!isRecord(value)) {
    return undefined;
  }
  const packageVersion = value["packageVersion"];
  const harnesses = value["harnesses"];
  const files = value["files"];
  if (typeof packageVersion !== "string" || !Array.isArray(harnesses) || !isRecord(files)) {
    return undefined;
  }
  const fileHashes: Record<string, string> = {};
  for (const [target, hash] of Object.entries(files)) {
    if (typeof hash !== "string") {
      return undefined;
    }
    fileHashes[target] = hash;
  }
  const known = harnesses.filter(
    (entry): entry is Harness =>
      typeof entry === "string" && (HARNESSES as ReadonlyArray<string>).includes(entry),
  );
  return { packageVersion, harnesses: known, files: fileHashes };
};

export const readReceipt = (env: Env): Effect.Effect<Receipt, never, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const raw = yield* fs.readFileString(receiptPath(env));
    return parseReceipt(raw) ?? emptyReceipt;
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
