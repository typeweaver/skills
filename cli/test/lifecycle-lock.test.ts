import { afterEach, assert, it } from "@effect/vitest";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { Env } from "../src/domain.js";
import { installLifecycle } from "../src/install-lifecycle.js";
import { readReceiptState } from "../src/receipt.js";
import { rootPaths } from "../src/env.js";

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
  const home = temporaryDirectory("typeweaver-skills-test-");
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
  agents: { kind: "none" as const },
  mode: "symlink" as const,
  force: false,
  dryRun: false,
});

it("installs native agent adapters as harness-specific copies", () => {
  const env = temporaryEnv();
  installLifecycle(
    {
      ...installRequest(env),
      harnesses: ["claude-code", "codex", "opencode"],
      skills: { kind: "none" },
      agents: { kind: "names", names: ["review-it"] },
    },
    "1.0.0",
  );
  const files = [
    join(env.home, ".claude", "agents", "review-it.md"),
    join(env.codexHome, "agents", "review-it.toml"),
    join(env.configHome, "opencode", "agents", "review-it.md"),
  ];
  assert.isTrue(files.every((file) => lstatSync(file).isFile()));
  assert.isTrue(files.every((file) => !lstatSync(file).isSymbolicLink()));
});

it("rolls back files and the receipt when failure occurs after receipt commit", () => {
  const env = temporaryEnv();
  assert.throws(() => {
    installLifecycle({ ...installRequest(env), failAfterReceiptCommit: true }, "1.0.0");
  });
  assert.isFalse(existsSync(join(env.home, ".agents", "skills", skillName)));
  assert.isFalse(existsSync(join(env.home, ".claude", "skills", skillName)));
  assert.equal(readReceiptState(rootPaths(env)).kind, "missing");
});

it("refuses concurrent mutation while a live process owns the lock", () => {
  const env = temporaryEnv();
  mkdirSync(rootPaths(env).state, { recursive: true });
  writeFileSync(join(rootPaths(env).state, "install.lock"), `${process.pid}:test-lock\n`);
  assert.throws(() => {
    installLifecycle(installRequest(env), "1.0.0");
  });
  assert.isFalse(existsSync(join(env.home, ".agents", "skills", skillName)));
  assert.equal(
    readFileSync(join(rootPaths(env).state, "install.lock"), "utf8"),
    `${process.pid}:test-lock\n`,
  );
});

it("refuses a leftover lock file even when the recorded pid is not alive", () => {
  const env = temporaryEnv();
  const lock = join(rootPaths(env).state, "install.lock");
  mkdirSync(rootPaths(env).state, { recursive: true });
  writeFileSync(lock, "2147483647:stale-lock\n");
  try {
    installLifecycle(installRequest(env), "1.0.0");
    assert.fail("expected leftover lock to refuse install");
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }
    assert.include(error.message, lock);
    assert.include(error.message, "delete that file");
  }
  assert.isFalse(existsSync(join(env.home, ".agents", "skills", skillName)));
  assert.equal(readFileSync(lock, "utf8"), "2147483647:stale-lock\n");
});
