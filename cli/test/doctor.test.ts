import { afterEach, assert, it } from "@effect/vitest";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { Env } from "../src/domain.js";
import { doctorLifecycle } from "../src/doctor-lifecycle.js";
import { rootPaths } from "../src/env.js";
import { installLifecycle } from "../src/install-lifecycle.js";

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

const doctor = (env: Env) => doctorLifecycle("1.0.0", { env, contentDirectory: repository });

it("reports a missing receipt as unhealthy", () => {
  const report = doctor(temporaryEnv());
  assert.equal(report.receiptState, "missing");
  assert.isTrue(report.issues.some((issue) => issue.message.includes("No Receipt v2")));
});

it("reports a legacy receipt as unhealthy without trusting its paths", () => {
  const env = temporaryEnv();
  mkdirSync(rootPaths(env).state, { recursive: true });
  writeFileSync(
    join(rootPaths(env).state, "receipt.json"),
    JSON.stringify({ packageVersion: "0.0.0", harnesses: ["codex"], files: { "/tmp/x": "x" } }),
  );
  const report = doctor(env);
  assert.equal(report.receiptState, "legacy");
  assert.isTrue(report.issues.length > 0);
  assert.equal(report.components.length, 0);
});

it("reports an invalid receipt as unhealthy", () => {
  const env = temporaryEnv();
  mkdirSync(rootPaths(env).state, { recursive: true });
  writeFileSync(join(rootPaths(env).state, "receipt.json"), "{not-json");
  const report = doctor(env);
  assert.equal(report.receiptState, "invalid");
  assert.isTrue(report.issues.length > 0);
});

it("reports a modified managed artifact as unhealthy", () => {
  const env = temporaryEnv();
  installLifecycle(installRequest(env), "1.0.0");
  writeFileSync(join(env.home, ".agents", "skills", skillName, "SKILL.md"), "user edit");
  const report = doctor(env);
  assert.equal(report.receiptState, "valid");
  assert.isTrue(report.issues.some((issue) => issue.message.includes("modified")));
});

it("reports an interrupted applying journal as unhealthy", () => {
  const env = temporaryEnv();
  installLifecycle(installRequest(env), "1.0.0");
  const receipt = readFileSync(join(rootPaths(env).state, "receipt.json"), "utf8");
  writeFileSync(
    join(rootPaths(env).state, "transaction.json"),
    `${JSON.stringify({
      schemaVersion: 1,
      id: "11111111-1111-4111-8111-111111111111",
      phase: "applying",
      previousReceipt: receipt,
      entries: [],
    })}\n`,
  );
  const report = doctor(env);
  assert.equal(report.transaction, "applying");
  assert.isTrue(report.issues.some((issue) => issue.message.includes("Interrupted transaction")));
});
