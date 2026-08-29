import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const temporary = mkdtempSync(join(tmpdir(), "typeweaver-skills-package-"));
const packageDirectory = join(temporary, "package");
const applicationDirectory = join(temporary, "application");
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

/**
 * @param {string} command
 * @param {...string} args
 */
const run = (command, ...args) => {
  const result = spawnSync(command, args, {
    cwd: repository,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
};

try {
  mkdirSync(packageDirectory);
  mkdirSync(applicationDirectory);
  run(pnpm, "--filter", "typeweaver-skills", "pack", "--pack-destination", packageDirectory);
  const tarballs = readdirSync(packageDirectory).filter((name) => name.endsWith(".tgz"));
  if (tarballs.length !== 1 || tarballs[0] === undefined) {
    throw new Error(`Expected one package tarball, found ${tarballs.length}.`);
  }
  const tarball = join(packageDirectory, tarballs[0]);
  const listing = spawnSync("tar", ["-tzf", tarball], { cwd: repository, encoding: "utf8" });
  if (listing.status !== 0 || typeof listing.stdout !== "string") {
    throw new Error("Could not inspect the package tarball.");
  }
  const inventory = new Set(listing.stdout.trim().split("\n"));
  for (const required of [
    "package/content/LICENSE",
    "package/content/skills/engineering/aurelius/SKILL.md",
    "package/content/agents/review-it/codex.toml",
    "package/dist/src/bin.js",
  ]) {
    if (!inventory.has(required)) {
      throw new Error(`Package artifact is missing ${required}.`);
    }
  }
  if (inventory.has("package/dist/src/engine.js")) {
    throw new Error("Package artifact contains the deleted legacy engine.");
  }
  run(pnpm, "add", "--dir", applicationDirectory, "--ignore-scripts", tarball);
  run(
    process.execPath,
    join(repository, "scripts", "check-cli-roundtrip.mjs"),
    join(applicationDirectory, "node_modules", "typeweaver-skills", "dist", "src", "bin.js"),
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
