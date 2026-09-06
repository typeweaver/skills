import { spawnSync } from "node:child_process";
import {
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

const repository = resolve(import.meta.dirname, "..");
/** @type {unknown} */
const manifest = JSON.parse(readFileSync(join(repository, "cli", "package.json"), "utf8"));
const expectedVersion =
  typeof manifest === "object" && manifest !== null && "version" in manifest
    ? manifest.version
    : undefined;
if (typeof expectedVersion !== "string") {
  throw new TypeError("cli/package.json does not declare a version.");
}
const temporary = mkdtempSync(join(tmpdir(), "equip-it-package-"));
const packageDirectory = join(temporary, "package");
const applicationDirectory = join(temporary, "application");
const npmApplicationDirectory = join(temporary, "application-npm");
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const binName = process.platform === "win32" ? "equip-it.cmd" : "equip-it";

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

/**
 * Collects every installed copy of a package below a node_modules tree.
 * @param {string} root
 * @param {string} name
 * @returns {string[]}
 */
const installedCopies = (root, name) => {
  /** @type {string[]} */
  const copies = [];
  /** @param {string} directory */
  const visit = (directory) => {
    if (!existsSync(directory)) {
      return;
    }
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      const path = join(directory, entry.name);
      if (entry.name === name) {
        copies.push(path);
      } else if (entry.name.startsWith("@")) {
        visit(path);
      }
      visit(join(path, "node_modules"));
    }
  };
  visit(root);
  return copies;
};

/**
 * Runs the installed executable and checks that it reports the packed version.
 * @param {string} applicationRoot
 * @param {string} installer
 */
const expectIdentity = (applicationRoot, installer) => {
  const bin = join(applicationRoot, "node_modules", ".bin", binName);
  if (!existsSync(bin)) {
    throw new Error(`Package installed with ${installer} does not expose the equip-it executable.`);
  }
  const version = spawnSync(bin, ["--version"], { cwd: applicationRoot, encoding: "utf8" });
  if (version.status !== 0 || version.stdout.trim() !== `equip-it v${expectedVersion}`) {
    throw new Error(
      `equip-it installed with ${installer} does not report its package identity:\n${version.stdout}${version.stderr}`,
    );
  }
};

try {
  mkdirSync(packageDirectory);
  mkdirSync(applicationDirectory);
  mkdirSync(npmApplicationDirectory);
  run(pnpm, "--filter", "equip-it", "pack", "--pack-destination", packageDirectory);
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
  expectIdentity(applicationDirectory, "pnpm");

  // npm (and therefore npx) installs peer dependencies itself. A version skew
  // between our pins and the transitive peer ranges nests a second copy of
  // effect, and two runtimes cannot share fibers or scopes.
  writeFileSync(
    join(npmApplicationDirectory, "package.json"),
    JSON.stringify({ name: "equip-it-consumer", private: true }),
  );
  run(
    npm,
    "install",
    "--prefix",
    npmApplicationDirectory,
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    tarball,
  );
  const effectCopies = installedCopies(join(npmApplicationDirectory, "node_modules"), "effect");
  if (effectCopies.length !== 1) {
    throw new Error(
      `npm installed ${effectCopies.length} copies of effect; expected exactly one:\n${effectCopies.join("\n")}`,
    );
  }
  expectIdentity(npmApplicationDirectory, "npm");
  run(
    process.execPath,
    join(repository, "scripts", "check-cli-roundtrip.mjs"),
    join(applicationDirectory, "node_modules", "equip-it", "dist", "src", "bin.js"),
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
