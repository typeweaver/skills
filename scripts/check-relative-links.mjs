#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoDir = dirname(dirname(fileURLToPath(import.meta.url)));
const errors = [];
const files = [];

const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path);
    } else if (entry.endsWith(".md")) {
      files.push(path);
    }
  }
};

walk(join(repoDir, "skills"));
walk(join(repoDir, "agents"));
files.push(join(repoDir, "README.md"));

const relative = (path) => path.slice(repoDir.length + 1);
const linkPattern = /\]\(([^)]+)\)/g;
const skipTarget = (target) =>
  target === "location" ||
  /^(?:[a-z][a-z0-9+.-]*:|#)/iu.test(target);

let checked = 0;
for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(linkPattern)) {
    const raw = match[1].trim();
    if (skipTarget(raw)) {
      continue;
    }
    const withoutFragment = raw.replace(/#.*$/u, "");
    if (withoutFragment.length === 0) {
      continue;
    }
    checked += 1;
    const resolved = resolve(dirname(file), withoutFragment);
    if (!existsSync(resolved)) {
      errors.push(`${relative(file)}: missing ${raw}`);
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`error: ${error}`);
  }
  process.exit(1);
}

console.log(`ok: ${checked} relative links resolve`);
