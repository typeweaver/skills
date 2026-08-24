import type { PlatformError } from "effect";
import { Effect, FileSystem } from "effect";
import { dirname } from "node:path";
import type { DesiredFile, Env, Plan, PlannedAction } from "./domain.js";
import { sha256 } from "./domain.js";
import { protectedDirs } from "./env.js";

type Fx<A> = Effect.Effect<A, PlatformError.PlatformError, FileSystem.FileSystem>;

/**
 * Current content hash per target path; `undefined` when the file is absent.
 * A symlink gets a sentinel hash that never matches content or receipt, so
 * the planner treats it as a user file: we neither write through a link (it
 * could point into a live checkout) nor remove it.
 */
export const diskState = (targets: Iterable<string>): Fx<Map<string, string | undefined>> =>
  Effect.gen(function* () {
    const disk = new Map<string, string | undefined>();
    for (const target of targets) {
      disk.set(target, yield* hashOnDisk(target));
    }
    return disk;
  });

const hashOnDisk = (target: string): Fx<string | undefined> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const link = yield* symlinkInPath(target);
    if (link !== undefined) {
      return `symlink:${link}`;
    }
    if (!(yield* fs.exists(target))) {
      return undefined;
    }
    return sha256(yield* fs.readFile(target));
  });

/**
 * Returns the first symlink found at the target or its nearest ancestors
 * (e.g. a whole skill directory linked by a development setup). Three levels
 * cover the deepest managed layout (skill/references/file).
 */
const symlinkInPath = (
  target: string,
): Effect.Effect<string | undefined, never, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    let path = target;
    for (let depth = 0; depth < 4; depth += 1) {
      const link = yield* Effect.orElseSucceed(fs.readLink(path), () => undefined);
      if (link !== undefined) {
        return path;
      }
      path = dirname(path);
    }
    return undefined;
  });

/** Writes every planned Create and Update; other actions never touch disk. */
export const writePlannedFiles = (plan: Plan, files: ReadonlyArray<DesiredFile>): Fx<void> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const byTarget = new Map(files.map((file) => [file.target, file]));
    for (const action of plan.actions) {
      if (action._tag !== "Create" && action._tag !== "Update") {
        continue;
      }
      const file = byTarget.get(action.target);
      if (file === undefined) {
        continue;
      }
      yield* fs.makeDirectory(dirname(file.target), { recursive: true });
      yield* fs.writeFile(file.target, file.content);
    }
  });

export const removeOrphans = (
  orphans: ReadonlyArray<PlannedAction>,
  env: Env,
): Fx<ReadonlyArray<string>> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const targets = orphans.filter((a) => a._tag === "RemoveOrphan").map((a) => a.target);
    for (const target of targets) {
      yield* fs.remove(target);
    }
    yield* removeEmptyParents(targets, env);
    return targets;
  });

const isEmptyDirectory = (dir: string): Effect.Effect<boolean, never, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return (yield* fs.readDirectory(dir)).length === 0;
  }).pipe(Effect.orElseSucceed(() => false));

const removeIfEmpty = (dir: string): Effect.Effect<boolean, never, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    if (!(yield* isEmptyDirectory(dir))) {
      return false;
    }
    yield* Effect.orElseSucceed(fs.remove(dir, { recursive: true }), () => undefined);
    return true;
  });

/**
 * Removing managed files can leave empty directories behind (a skill's
 * references/, or the skill directory itself). Climb up to three levels from
 * each removed file and drop directories that ended up empty, stopping at the
 * protected harness and container directories.
 */
const removeEmptyParents = (
  files: ReadonlyArray<string>,
  env: Env,
): Effect.Effect<void, never, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const keep = protectedDirs(env);
    const startDirs = new Set(files.map((file) => dirname(file)));
    for (const start of startDirs) {
      yield* climbAndRemove(start, keep);
    }
  });

const climbAndRemove = (
  start: string,
  keep: ReadonlySet<string>,
): Effect.Effect<void, never, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    let dir = start;
    for (let depth = 0; depth < 3; depth += 1) {
      if (keep.has(dir)) {
        return;
      }
      if (!(yield* removeIfEmpty(dir))) {
        return;
      }
      dir = dirname(dir);
    }
  });
