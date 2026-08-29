import { afterEach, assert, it } from "@effect/vitest";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { Env } from "../src/domain.js";
import { ConflictError } from "../src/errors.js";
import { installLifecycle } from "../src/install-lifecycle.js";
import { updateLifecycle } from "../src/update-lifecycle.js";
import { readReceiptState } from "../src/receipt.js";
import { rootPaths } from "../src/env.js";
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
  const home = temporaryDirectory("typeweaver-skills-test-");
  return {
    home,
    codexHome: join(home, ".codex"),
    configHome: join(home, ".config"),
    kiroHome: join(home, ".kiro"),
  };
};

const installRequest = (env: Env, contentDirectory = repository) => ({
  env,
  contentDirectory,
  harnesses: ["claude-code", "codex"] as const,
  skills: { kind: "names" as const, names: [skillName] },
  agents: { kind: "none" as const },
  mode: "symlink" as const,
  force: false,
  dryRun: false,
});

const leftoverBackups = (directory: string): ReadonlyArray<string> =>
  existsSync(directory)
    ? readdirSync(directory).filter((entry) => entry.startsWith(".typeweaver-skills-"))
    : [];

it("surfaces conflict paths and reasons in the thrown error message", () => {
  const env = temporaryEnv();
  const canonical = join(env.home, ".agents", "skills", skillName);
  mkdirSync(canonical, { recursive: true });
  writeFileSync(join(canonical, "user.txt"), "foreign");
  try {
    installLifecycle(installRequest(env), "1.0.0");
    assert.fail("expected ConflictError");
  } catch (error) {
    if (!(error instanceof ConflictError)) {
      throw error;
    }
    assert.include(error.message, `canonical-skills:${skillName}`);
    assert.include(error.message, "foreign or has been modified");
  }
});

it("restores replaced content when mutation fails after the backup rename", () => {
  const env = temporaryEnv();
  const canonical = join(env.home, ".agents", "skills", skillName);
  installLifecycle(installRequest(env), "1.0.0");
  writeFileSync(join(canonical, "SKILL.md"), "user edit");
  assert.throws(() => {
    installLifecycle({ ...installRequest(env), force: true, failAfterBackupRename: true }, "1.0.0");
  });
  assert.equal(readFileSync(join(canonical, "SKILL.md"), "utf8"), "user edit");
  assert.deepEqual(leftoverBackups(join(env.home, ".agents", "skills")), []);
  assert.isFalse(existsSync(join(rootPaths(env).state, "transaction.json")));
});

it("recovers a planted applying journal before the next mutation", () => {
  const env = temporaryEnv();
  const canonical = join(env.home, ".agents", "skills", skillName);
  installLifecycle(installRequest(env), "1.0.0");
  const roots = rootPaths(env);
  const receipt = readFileSync(join(roots.state, "receipt.json"), "utf8");
  writeFileSync(
    join(roots.state, "transaction.json"),
    `${JSON.stringify({
      schemaVersion: 1,
      id: "11111111-1111-4111-8111-111111111111",
      phase: "applying",
      previousReceipt: receipt,
      entries: [],
    })}\n`,
  );
  const report = updateLifecycle(
    { env, contentDirectory: repository, force: false, dryRun: false },
    "1.1.0",
  );
  assert.equal(report.recovery, "rolled-back");
  assert.isTrue(existsSync(join(canonical, "SKILL.md")));
  assert.isFalse(existsSync(join(roots.state, "transaction.json")));
});

it("rejects an unknown name without touching an existing installation", () => {
  const env = temporaryEnv();
  const canonical = join(env.home, ".agents", "skills", skillName);
  installLifecycle(installRequest(env), "1.0.0");
  assert.throws(() => {
    installLifecycle(
      { ...installRequest(env), skills: { kind: "names", names: ["typo-does-not-exist"] } },
      "1.0.0",
    );
  });
  assert.isTrue(existsSync(join(canonical, "SKILL.md")));
  const state = readReceiptState(rootPaths(env));
  assert.equal(state.kind, "valid");
  if (state.kind === "valid") {
    assert.deepEqual(
      state.receipt.components.map(({ key }) => key),
      [`skill:${skillName}`],
    );
  }
});

it("update does not install omitted bundled skills", () => {
  const env = temporaryEnv();
  installLifecycle(installRequest(env), "1.0.0");
  updateLifecycle({ env, contentDirectory: repository, force: false, dryRun: false }, "1.1.0");
  assert.isTrue(existsSync(join(env.home, ".agents", "skills", skillName, "SKILL.md")));
  assert.isFalse(existsSync(join(env.home, ".agents", "skills", "brief-me")));
});

it("scoped uninstall does not rewrite remaining content from a newer package", () => {
  const env = temporaryEnv();
  const content = temporaryDirectory("typeweaver-content-");
  const source = join(content, "skills", "engineering", skillName);
  mkdirSync(join(content, "agents"), { recursive: true });
  cpSync(join(repository, "skills", "engineering", skillName), source, { recursive: true });
  const installed = join(env.home, ".agents", "skills", skillName, "SKILL.md");
  installLifecycle(installRequest(env, content), "1.0.0");
  const original = readFileSync(installed);
  writeFileSync(join(source, "SKILL.md"), "package-v2");
  uninstallLifecycle(
    {
      env,
      contentDirectory: content,
      force: false,
      dryRun: false,
      harnesses: ["claude-code"],
      skills: { kind: "all" },
    },
    "1.1.0",
  );
  assert.deepEqual(readFileSync(installed), original);
  assert.isFalse(existsSync(join(env.home, ".claude", "skills", skillName)));
});
