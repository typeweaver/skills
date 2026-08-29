import type { PlatformError } from "effect";
import { Effect, FileSystem } from "effect";
import { join } from "node:path";
import type { Env, Harness, RootPaths } from "./domain.js";

export const envFromProcess = (): Env => {
  const home = process.env["HOME"] ?? process.env["USERPROFILE"] ?? "";
  return {
    home,
    codexHome: process.env["CODEX_HOME"] ?? join(home, ".codex"),
    configHome: process.env["XDG_CONFIG_HOME"] ?? join(home, ".config"),
    kiroHome: process.env["KIRO_HOME"] ?? join(home, ".kiro"),
  };
};

/**
 * Centralized native user roots. Keep these aligned with the primary harness
 * docs: https://learn.chatgpt.com/docs/build-skills,
 * https://learn.chatgpt.com/docs/agent-configuration/subagents,
 * https://code.claude.com/docs/en/configuration,
 * https://code.claude.com/docs/en/slash-commands,
 * https://opencode.ai/docs/skills, https://opencode.ai/v2/docs/agents, and
 * https://kiro.dev/docs/skills/.
 */
export const rootPaths = (env: Env): RootPaths => ({
  "canonical-skills": join(env.home, ".agents", "skills"),
  "claude-skills": join(env.home, ".claude", "skills"),
  "kiro-skills": join(env.kiroHome, "skills"),
  "claude-agents": join(env.home, ".claude", "agents"),
  "opencode-agents": join(env.configHome, "opencode", "agents"),
  "codex-agents": join(env.codexHome, "agents"),
  "codex-profiles": env.codexHome,
  state: join(env.configHome, "typeweaver-skills"),
});

/** A harness counts as present when its user configuration directory exists. */
export const detectHarnesses = (
  env: Env,
): Effect.Effect<ReadonlyArray<Harness>, PlatformError.PlatformError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const candidates: ReadonlyArray<readonly [Harness, string]> = [
      ["claude-code", join(env.home, ".claude")],
      ["codex", env.codexHome],
      ["opencode", join(env.configHome, "opencode")],
      ["kiro", env.kiroHome],
    ];
    const found: Array<Harness> = [];
    for (const [harness, directory] of candidates) {
      if (yield* fs.exists(directory)) {
        found.push(harness);
      }
    }
    return found;
  });
