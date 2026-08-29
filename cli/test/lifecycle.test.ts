import { afterEach, assert, it } from "@effect/vitest";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { Env } from "../src/domain.js";
import { doctorLifecycle } from "../src/doctor-lifecycle.js";
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

const receiptFor = (env: Env) => readReceiptState(rootPaths(env));

it("installs one canonical skill plus a Claude projection and removes all owned state", () => {
  const env = temporaryEnv();
  const report = installLifecycle(installRequest(env), "1.0.0");
  const canonical = join(env.home, ".agents", "skills", skillName);
  const projection = join(env.home, ".claude", "skills", skillName);

  assert.equal(report.componentCount, 1);
  assert.isTrue(lstatSync(canonical).isDirectory());
  assert.isTrue(lstatSync(projection).isSymbolicLink());
  assert.equal(resolve(join(projection, ".."), readlinkSync(projection)), canonical);
  const state = receiptFor(env);
  assert.equal(state.kind, "valid");
  if (state.kind === "valid") {
    assert.equal(state.receipt.components.length, 1);
  }
  assert.equal(doctorLifecycle("1.0.0", { env, contentDirectory: repository }).issues.length, 0);

  uninstallLifecycle({ env, contentDirectory: repository, force: false, dryRun: false }, "1.0.0");
  assert.isFalse(existsSync(canonical));
  assert.isFalse(existsSync(projection));
  assert.isFalse(existsSync(rootPaths(env).state));
});

it("adopts an exact skills.sh-style copy and symlink without rewriting them", () => {
  const env = temporaryEnv();
  const canonical = join(env.home, ".agents", "skills", skillName);
  const projection = join(env.home, ".claude", "skills", skillName);
  mkdirSync(join(env.home, ".agents", "skills"), { recursive: true });
  mkdirSync(join(env.home, ".claude", "skills"), { recursive: true });
  cpSync(join(repository, "skills", "engineering", skillName), canonical, { recursive: true });
  symlinkSync(canonical, projection, "dir");

  const report = installLifecycle(installRequest(env), "1.0.0");
  assert.deepEqual(
    report.actions.map((action) => action.kind),
    ["Adopt", "Adopt"],
  );
  assert.isTrue(lstatSync(projection).isSymbolicLink());
});

it("rejects unknown names before creating state or target roots", () => {
  const env = temporaryEnv();
  assert.throws(() => {
    installLifecycle(
      {
        ...installRequest(env),
        skills: { kind: "names", names: ["typo-does-not-exist"] },
      },
      "1.0.0",
    );
  });
  assert.isFalse(existsSync(join(env.home, ".agents")));
  assert.isFalse(existsSync(rootPaths(env).state));
});

it("preserves a partial selection during update", () => {
  const env = temporaryEnv();
  installLifecycle(installRequest(env), "1.0.0");
  const report = updateLifecycle(
    { env, contentDirectory: repository, force: false, dryRun: false },
    "1.1.0",
  );
  const state = receiptFor(env);
  assert.equal(report.componentCount, 1);
  assert.equal(state.kind, "valid");
  if (state.kind === "valid") {
    assert.deepEqual(
      state.receipt.components.map(({ key }) => key),
      [`skill:${skillName}`],
    );
  }
});

it("fails closed on foreign content and --force replaces only the selected component", () => {
  const env = temporaryEnv();
  const canonical = join(env.home, ".agents", "skills", skillName);
  mkdirSync(canonical, { recursive: true });
  writeFileSync(join(canonical, "user.txt"), "foreign");

  assert.throws(() => {
    installLifecycle(installRequest(env), "1.0.0");
  }, ConflictError);
  assert.equal(readFileSync(join(canonical, "user.txt"), "utf8"), "foreign");
  installLifecycle({ ...installRequest(env), force: true }, "1.0.0");
  assert.isFalse(existsSync(join(canonical, "user.txt")));
  assert.isTrue(existsSync(join(canonical, "SKILL.md")));
});

it("never follows a symlinked harness root, including with --force", () => {
  const env = temporaryEnv();
  const outside = temporaryDirectory("typeweaver-skills-outside-");
  writeFileSync(join(outside, "sentinel"), "unchanged");
  symlinkSync(outside, join(env.home, ".agents"), "dir");

  assert.throws(() => {
    installLifecycle({ ...installRequest(env), force: true }, "1.0.0");
  });
  assert.equal(readFileSync(join(outside, "sentinel"), "utf8"), "unchanged");
  assert.isFalse(existsSync(join(outside, "skills", skillName)));
});

it("rolls back after every component mutation boundary", () => {
  for (const failAfterActions of [1, 2]) {
    const env = temporaryEnv();
    assert.throws(() => {
      installLifecycle({ ...installRequest(env), failAfterActions }, "1.0.0");
    });
    assert.isFalse(existsSync(join(env.home, ".agents", "skills", skillName)));
    assert.isFalse(existsSync(join(env.home, ".claude", "skills", skillName)));
    assert.equal(receiptFor(env).kind, "missing");
  }
});

it("dry-run reports exact actions without creating files or receipt state", () => {
  const env = temporaryEnv();
  const report = installLifecycle({ ...installRequest(env), dryRun: true }, "1.0.0");
  assert.deepEqual(
    report.actions.map((action) => action.kind),
    ["Create", "Create"],
  );
  assert.isFalse(existsSync(join(env.home, ".agents")));
  assert.equal(receiptFor(env).kind, "missing");
});

it("copy mode records and maintains independent skill directories", () => {
  const env = temporaryEnv();
  installLifecycle(
    {
      ...installRequest(env),
      harnesses: ["claude-code"],
      mode: "copy",
    },
    "1.0.0",
  );
  const canonical = join(env.home, ".agents", "skills", skillName);
  const projection = join(env.home, ".claude", "skills", skillName);
  assert.isTrue(lstatSync(canonical).isDirectory());
  assert.isTrue(lstatSync(projection).isDirectory());
  const state = receiptFor(env);
  if (state.kind === "valid") {
    const component = state.receipt.components[0];
    assert.equal(component?.kind, "skill");
    if (component?.kind === "skill") {
      assert.equal(component.requestedMode, "copy");
    }
  }
});

it("partial uninstall removes one consumer but retains shared canonical content", () => {
  const env = temporaryEnv();
  installLifecycle(installRequest(env), "1.0.0");
  uninstallLifecycle(
    {
      env,
      contentDirectory: repository,
      force: false,
      dryRun: false,
      harnesses: ["claude-code"],
      skills: { kind: "all" },
    },
    "1.0.0",
  );
  assert.isTrue(existsSync(join(env.home, ".agents", "skills", skillName, "SKILL.md")));
  assert.isFalse(existsSync(join(env.home, ".claude", "skills", skillName)));
  const state = receiptFor(env);
  if (state.kind === "valid") {
    assert.deepEqual(state.receipt.components[0]?.consumers, ["codex"]);
  }
});

it("requires force for a mode change and then converts the projection", () => {
  const env = temporaryEnv();
  const copied = {
    ...installRequest(env),
    harnesses: ["claude-code"] as const,
    mode: "copy" as const,
  };
  installLifecycle(copied, "1.0.0");
  assert.throws(() => {
    installLifecycle({ ...copied, mode: "symlink" }, "1.0.0");
  }, ConflictError);
  installLifecycle({ ...copied, mode: "symlink", force: true }, "1.0.0");
  assert.isTrue(lstatSync(join(env.home, ".claude", "skills", skillName)).isSymbolicLink());
});

it("force replaces an exact component symlink without touching its target", () => {
  const env = temporaryEnv();
  const outside = temporaryDirectory("typeweaver-component-target-");
  writeFileSync(join(outside, "sentinel"), "unchanged");
  const canonical = join(env.home, ".agents", "skills", skillName);
  mkdirSync(join(env.home, ".agents", "skills"), { recursive: true });
  symlinkSync(outside, canonical, "dir");

  installLifecycle({ ...installRequest(env), force: true }, "1.0.0");
  assert.isTrue(lstatSync(canonical).isDirectory());
  assert.equal(readFileSync(join(outside, "sentinel"), "utf8"), "unchanged");
});

it("force replaces a component containing a nested symlink without traversing it", () => {
  const env = temporaryEnv();
  const outside = temporaryDirectory("typeweaver-nested-target-");
  writeFileSync(join(outside, "sentinel"), "unchanged");
  const canonical = join(env.home, ".agents", "skills", skillName);
  mkdirSync(canonical, { recursive: true });
  symlinkSync(outside, join(canonical, "nested"), "dir");

  installLifecycle({ ...installRequest(env), force: true }, "1.0.0");
  assert.isFalse(existsSync(join(canonical, "nested")));
  assert.equal(readFileSync(join(outside, "sentinel"), "utf8"), "unchanged");
});

it("uninstall rejects modified owned content normally and removes it with force", () => {
  const env = temporaryEnv();
  const canonical = join(env.home, ".agents", "skills", skillName);
  installLifecycle(installRequest(env), "1.0.0");
  writeFileSync(join(canonical, "SKILL.md"), "user edit");

  assert.throws(() => {
    uninstallLifecycle({ env, contentDirectory: repository, force: false, dryRun: false }, "1.0.0");
  }, ConflictError);
  assert.equal(readFileSync(join(canonical, "SKILL.md"), "utf8"), "user edit");
  uninstallLifecycle({ env, contentDirectory: repository, force: true, dryRun: false }, "1.0.0");
  assert.isFalse(existsSync(canonical));
});

it("receiptless uninstall removes exact current artifacts after explicit intent", () => {
  const env = temporaryEnv();
  const canonical = join(env.home, ".agents", "skills", skillName);
  const projection = join(env.home, ".claude", "skills", skillName);
  mkdirSync(join(env.home, ".agents", "skills"), { recursive: true });
  mkdirSync(join(env.home, ".claude", "skills"), { recursive: true });
  cpSync(join(repository, "skills", "engineering", skillName), canonical, { recursive: true });
  symlinkSync(canonical, projection, "dir");

  uninstallLifecycle({ env, contentDirectory: repository, force: false, dryRun: false }, "1.0.0");
  assert.isFalse(existsSync(canonical));
  assert.isFalse(existsSync(projection));
});

it("never trusts absolute paths from a legacy receipt during uninstall", () => {
  const env = temporaryEnv();
  const outside = join(env.home, "must-survive");
  writeFileSync(outside, "unchanged");
  mkdirSync(rootPaths(env).state, { recursive: true });
  writeFileSync(
    join(rootPaths(env).state, "receipt.json"),
    JSON.stringify({ packageVersion: "0.0.0", harnesses: ["codex"], files: { [outside]: "x" } }),
  );

  uninstallLifecycle({ env, contentDirectory: repository, force: false, dryRun: false }, "1.0.0");
  assert.equal(readFileSync(outside, "utf8"), "unchanged");
  assert.isFalse(existsSync(rootPaths(env).state));
});

it("rejects symlinked state roots and receipt files without touching their targets", () => {
  const env = temporaryEnv();
  const outside = temporaryDirectory("typeweaver-state-target-");
  writeFileSync(join(outside, "sentinel"), "unchanged");
  mkdirSync(env.configHome, { recursive: true });
  symlinkSync(outside, rootPaths(env).state, "dir");
  assert.throws(() => {
    installLifecycle({ ...installRequest(env), force: true }, "1.0.0");
  });
  assert.equal(readFileSync(join(outside, "sentinel"), "utf8"), "unchanged");

  const second = temporaryEnv();
  mkdirSync(rootPaths(second).state, { recursive: true });
  const externalReceipt = join(outside, "receipt.json");
  writeFileSync(externalReceipt, "{}\n");
  symlinkSync(externalReceipt, join(rootPaths(second).state, "receipt.json"));
  assert.throws(() => {
    installLifecycle({ ...installRequest(second), force: true }, "1.0.0");
  });
  assert.equal(readFileSync(externalReceipt, "utf8"), "{}\n");
});
