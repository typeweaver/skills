import { Effect, FileSystem } from "effect";
import { Flag } from "effect/unstable/cli";
import { dirname, join } from "node:path";
import type { ContentSelection, Harness } from "./domain.js";
import { isRecord } from "./domain.js";
import { LifecycleError } from "./errors.js";

const parseCommaList = (value: string): ReadonlyArray<string> =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

export const parseSelection = (value: string): ContentSelection => {
  if (value === "all" || value === "none") {
    return { kind: value };
  }
  const names = parseCommaList(value);
  if (names.length === 0) {
    throw new LifecycleError({
      message: "Content selection must be 'all', 'none', or a comma-separated name list.",
    });
  }
  return { kind: "names", names };
};

export const packageVersion: Effect.Effect<string, never, FileSystem.FileSystem> = Effect.gen(
  function* () {
    const fs = yield* FileSystem.FileSystem;
    const pkgPath = join(dirname(dirname(import.meta.dirname)), "package.json");
    const raw = yield* fs.readFileString(pkgPath);
    const value: unknown = JSON.parse(raw);
    return isRecord(value) && typeof value["version"] === "string" ? value["version"] : "0.0.0";
  },
).pipe(Effect.orElseSucceed(() => "0.0.0"));

export const harnessFlag = (name: Harness, description: string) =>
  Flag.boolean(name).pipe(Flag.withDefault(false), Flag.withDescription(description));

export const mutationFlags = {
  force: Flag.boolean("force").pipe(
    Flag.withDefault(false),
    Flag.withDescription("Replace conflicting selected components; no backup is retained"),
  ),
  dryRun: Flag.boolean("dry-run").pipe(
    Flag.withDefault(false),
    Flag.withDescription("Show the complete plan without changing anything"),
  ),
};
