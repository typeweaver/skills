import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, mkdtempSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const executable =
  process.argv[2] === undefined
    ? join(repository, "cli", "dist", "src", "bin.js")
    : resolve(process.argv[2]);
const temporary = mkdtempSync(join(tmpdir(), "typeweaver-skills-roundtrip-"));
const home = join(temporary, "home");
const configHome = join(home, ".config");
const env = {
  ...process.env,
  HOME: home,
  USERPROFILE: home,
  XDG_CONFIG_HOME: configHome,
  CODEX_HOME: join(home, ".codex"),
  KIRO_HOME: join(home, ".kiro"),
};

/** @param {...string} args */
const run = (...args) => {
  const result = spawnSync(process.execPath, [executable, ...args], {
    cwd: repository,
    env,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? "");
    process.stderr.write(result.stderr ?? "");
    throw new Error(`CLI command failed: ${args.join(" ")}`);
  }
};

/**
 * @param {boolean} condition
 * @param {string} message
 */
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

try {
  for (const directory of [
    join(home, ".claude"),
    join(home, ".codex"),
    join(configHome, "opencode"),
    join(home, ".kiro"),
  ]) {
    mkdirSync(directory, { recursive: true });
  }

  const copy = process.platform === "win32" ? ["--copy"] : [];
  run(
    "install",
    "--claude-code",
    "--codex",
    "--opencode",
    "--kiro",
    "--skills",
    "aurelius",
    "--agents",
    "review-it",
    "--yes",
    ...copy,
  );

  const canonical = join(home, ".agents", "skills", "aurelius", "SKILL.md");
  const claudeSkill = join(home, ".claude", "skills", "aurelius");
  const kiroSkill = join(home, ".kiro", "skills", "aurelius");
  const receipt = join(configHome, "typeweaver-skills", "receipt.json");
  assert(existsSync(canonical), "canonical skill was not installed");
  assert(existsSync(join(home, ".claude", "agents", "review-it.md")), "Claude agent missing");
  assert(
    existsSync(join(configHome, "opencode", "agents", "review-it.md")),
    "OpenCode agent missing",
  );
  assert(existsSync(join(home, ".codex", "agents", "review-it.toml")), "Codex agent missing");
  assert(existsSync(receipt), "receipt was not installed");
  assert(/"schemaVersion"\s*:\s*2/u.test(readFileSync(receipt, "utf8")), "receipt is not v2");
  if (process.platform === "win32") {
    assert(lstatSync(claudeSkill).isDirectory(), "Claude skill copy missing");
    assert(lstatSync(kiroSkill).isDirectory(), "Kiro skill copy missing");
  } else {
    assert(lstatSync(claudeSkill).isSymbolicLink(), "Claude skill symlink missing");
    assert(lstatSync(kiroSkill).isSymbolicLink(), "Kiro skill symlink missing");
  }

  run("doctor");
  run("update");
  assert(existsSync(canonical), "canonical skill missing after update");
  assert(existsSync(receipt), "receipt missing after update");
  assert(
    /"schemaVersion"\s*:\s*2/u.test(readFileSync(receipt, "utf8")),
    "receipt is not v2 after update",
  );
  run("doctor");
  run("uninstall");

  assert(!existsSync(join(home, ".agents", "skills", "aurelius")), "canonical skill remains");
  assert(!existsSync(claudeSkill), "Claude skill remains");
  assert(!existsSync(kiroSkill), "Kiro skill remains");
  assert(!existsSync(join(home, ".claude", "agents", "review-it.md")), "Claude agent remains");
  assert(
    !existsSync(join(configHome, "opencode", "agents", "review-it.md")),
    "OpenCode agent remains",
  );
  assert(!existsSync(join(home, ".codex", "agents", "review-it.toml")), "Codex agent remains");
  assert(!existsSync(join(configHome, "typeweaver-skills")), "installer state remains");
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
