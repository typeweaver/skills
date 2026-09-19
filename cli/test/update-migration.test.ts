import { afterEach, assert, it } from "@effect/vitest";
import { cpSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { Env } from "../src/domain.js";
import { doctorLifecycle } from "../src/doctor-lifecycle.js";
import { rootPaths } from "../src/env.js";
import { installLifecycle } from "../src/install-lifecycle.js";
import { readReceiptState } from "../src/receipt.js";
import { updateLifecycle } from "../src/update-lifecycle.js";

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
  const home = temporaryDirectory("equip-it-migration-");
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

const receiptFor = (env: Env) => readReceiptState(rootPaths(env));

/** Simulates a pre-requirement receipt that recorded an agent but no skill. */
const keepAgentsOnlyInReceipt = (env: Env): void => {
  const state = receiptFor(env);
  assert.equal(state.kind, "valid");
  if (state.kind === "valid") {
    const legacy = {
      ...state.receipt,
      components: state.receipt.components.filter((component) => component.kind === "agent"),
    };
    writeFileSync(
      join(rootPaths(env).state, "receipt.json"),
      `${JSON.stringify(legacy, null, 2)}\n`,
    );
  }
};

it("rejects updating a legacy agent-only receipt", () => {
  const env = temporaryEnv();
  installLifecycle(installRequest(env), "1.0.0");
  keepAgentsOnlyInReceipt(env);
  assert.throws(() => {
    updateLifecycle({ env, contentDirectory: repository, force: false, dryRun: false }, "1.1.0");
  }, /install the repository skills too/u);
});

it("reports a legacy agent-only receipt as unhealthy", () => {
  const env = temporaryEnv();
  installLifecycle(installRequest(env), "1.0.0");
  keepAgentsOnlyInReceipt(env);
  const report = doctorLifecycle("1.0.0", { env, contentDirectory: repository });
  assert.isTrue(report.issues.some((issue) => /repository skills/u.test(issue.message)));
});

it("rejects an update whose package no longer provides the installed skill", () => {
  const env = temporaryEnv();
  installLifecycle(installRequest(env), "1.0.0");

  const evolved = temporaryDirectory("equip-it-content-");
  cpSync(join(repository, "skills"), join(evolved, "skills"), { recursive: true });
  cpSync(join(repository, "agents"), join(evolved, "agents"), { recursive: true });
  rmSync(join(evolved, "skills", "engineering", skillName), { recursive: true });

  assert.throws(() => {
    updateLifecycle({ env, contentDirectory: evolved, force: false, dryRun: false }, "1.1.0");
  }, /install the repository skills too/u);
});

it("preserves a valid skill and agent selection during update", () => {
  const env = temporaryEnv();
  installLifecycle(installRequest(env), "1.0.0");
  const report = updateLifecycle(
    { env, contentDirectory: repository, force: false, dryRun: false },
    "1.1.0",
  );
  const state = receiptFor(env);
  assert.equal(report.componentCount, 2);
  assert.equal(state.kind, "valid");
  if (state.kind === "valid") {
    assert.deepEqual(
      state.receipt.components.map(({ key }) => key).toSorted(),
      ["agent:review-it", `skill:${skillName}`].toSorted(),
    );
  }
});
