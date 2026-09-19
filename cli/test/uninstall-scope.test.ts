import { afterEach, assert, it } from "@effect/vitest";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { Env } from "../src/domain.js";
import { rootPaths } from "../src/env.js";
import { installLifecycle } from "../src/install-lifecycle.js";
import { uninstallLifecycle } from "../src/uninstall-lifecycle.js";

const repository = resolve(import.meta.dirname, "../..");
const skillName = "define-goal";
const temporaryDirectories = new Set<string>();

const temporaryDirectory = (prefix: string): string => {
  const directory = mkdtempSync(join(tmpdir(), prefix));
  temporaryDirectories.add(directory);
  return directory;
};

afterEach(() => {
  for (const directory of temporaryDirectories) {
    rmSync(directory, { recursive: true, force: true });
  }
  temporaryDirectories.clear();
});

const temporaryEnv = (): Env => {
  const home = temporaryDirectory("equip-it-uninstall-");
  return {
    home,
    codexHome: join(home, ".codex"),
    configHome: join(home, ".config"),
    kiroHome: join(home, ".kiro"),
  };
};

const installRequest = (env: Env) => ({
  env,
  contentDirectory: repository,
  harnesses: ["claude-code", "codex"] as const,
  skills: { kind: "names" as const, names: [skillName] },
  agents: { kind: "names" as const, names: ["review-it"] },
  mode: "symlink" as const,
  force: false,
  dryRun: false,
});

it("rejects a scoped uninstall that removes every skill but keeps an agent", () => {
  const env = temporaryEnv();
  installLifecycle(installRequest(env), "1.0.0");
  assert.throws(() => {
    uninstallLifecycle(
      {
        env,
        contentDirectory: repository,
        skills: { kind: "all" },
        agents: { kind: "none" },
        force: false,
        dryRun: false,
      },
      "1.0.0",
    );
  }, /Uninstall the agents too/u);
  assert.isTrue(existsSync(join(env.home, ".agents", "skills", skillName)));
  assert.isTrue(existsSync(join(env.home, ".claude", "agents", "review-it.md")));
});

it("allows a complete uninstall that removes every component", () => {
  const env = temporaryEnv();
  installLifecycle(installRequest(env), "1.0.0");
  const report = uninstallLifecycle(
    { env, contentDirectory: repository, force: false, dryRun: false },
    "1.0.0",
  );

  assert.isTrue(report.componentCount >= 2);
  assert.isFalse(existsSync(join(env.home, ".agents", "skills", skillName)));
  assert.isFalse(existsSync(join(env.home, ".claude", "agents", "review-it.md")));
  assert.isFalse(existsSync(rootPaths(env).state));
});
