import { Effect, FileSystem, PlatformError } from "effect";
import { join } from "node:path";
import type { Env, Harness } from "./domain.js";

export const envFromProcess = (): Env => {
  const home = process.env.HOME ?? process.env.USERPROFILE ?? "";
  return {
    home,
    codexHome: process.env.CODEX_HOME ?? join(home, ".codex"),
    configHome: process.env.XDG_CONFIG_HOME ?? join(home, ".config"),
  };
};

/** A harness counts as present when its home directory exists. */
export const detectHarnesses = (
  env: Env,
): Effect.Effect<ReadonlyArray<Harness>, PlatformError.PlatformError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const candidates: ReadonlyArray<readonly [Harness, string]> = [
      ["claude-code", join(env.home, ".claude")],
      ["codex", env.codexHome],
      ["opencode", join(env.configHome, "opencode")],
      ["kiro", join(env.home, ".kiro")],
    ];
    const found: Array<Harness> = [];
    for (const [harness, dir] of candidates) {
      if (yield* fs.exists(dir)) found.push(harness);
    }
    return found;
  });

/**
 * Directories the installer must never delete, even when empty: their
 * existence carries meaning (harness detection) and they are not ours.
 */
export const protectedDirs = (env: Env): ReadonlySet<string> =>
  new Set([
    env.home,
    join(env.home, ".claude"),
    join(env.home, ".claude", "skills"),
    join(env.home, ".claude", "agents"),
    join(env.home, ".agents"),
    join(env.home, ".agents", "skills"),
    join(env.home, ".kiro"),
    join(env.home, ".kiro", "skills"),
    env.codexHome,
    join(env.codexHome, "agents"),
    env.configHome,
    join(env.configHome, "opencode"),
    join(env.configHome, "opencode", "agents"),
    join(env.configHome, "typeweaver-skills"),
  ]);
