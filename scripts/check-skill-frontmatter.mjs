#!/usr/bin/env node
import { createRequire } from "node:module";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoDir = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(join(repoDir, "cli/package.json"));
const YAML = require("yaml");

const errors = [];

const walk = (dir, suffix, found) => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path, suffix, found);
    } else if (path.endsWith(suffix)) {
      found.push(path);
    }
  }
};

const relative = (path) => path.slice(repoDir.length + 1);

const parseYaml = (path, text) => {
  try {
    return YAML.parse(text);
  } catch (error) {
    errors.push(`${relative(path)}: ${error.message}`);
    return undefined;
  }
};

const isMapping = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const skillFiles = [];
walk(join(repoDir, "skills"), "SKILL.md", skillFiles);
for (const path of skillFiles) {
  const text = readFileSync(path, "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u);
  if (match === null) {
    errors.push(`${relative(path)}: missing YAML frontmatter`);
    continue;
  }
  const data = parseYaml(path, match[1]);
  if (data === undefined) {
    continue;
  }
  if (!isMapping(data)) {
    errors.push(`${relative(path)}: frontmatter is not a mapping`);
    continue;
  }
  if (typeof data.name !== "string" || data.name.length === 0) {
    errors.push(`${relative(path)}: name must be a string`);
  }
  if (typeof data.description !== "string" || data.description.length === 0) {
    errors.push(`${relative(path)}: description must be a string`);
  }
}

const openaiFiles = [];
walk(join(repoDir, "skills"), "openai.yaml", openaiFiles);
for (const path of openaiFiles) {
  const data = parseYaml(path, readFileSync(path, "utf8"));
  if (data === undefined) {
    continue;
  }
  if (!isMapping(data)) {
    errors.push(`${relative(path)}: not a mapping`);
    continue;
  }
  const iface = data.interface;
  if (!isMapping(iface)) {
    errors.push(`${relative(path)}: interface must be a mapping`);
    continue;
  }
  if (typeof iface.display_name !== "string" || iface.display_name.length === 0) {
    errors.push(`${relative(path)}: interface.display_name must be a string`);
  }
  if (
    typeof iface.short_description !== "string" ||
    iface.short_description.length === 0
  ) {
    errors.push(`${relative(path)}: interface.short_description must be a string`);
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`error: ${error}`);
  }
  process.exit(1);
}

console.log(
  `ok: parsed ${skillFiles.length} SKILL.md and ${openaiFiles.length} openai.yaml files`,
);
