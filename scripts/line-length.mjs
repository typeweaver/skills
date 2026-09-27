import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

export const MAX_LINE_LENGTH = 120;

/** Directories whose Markdown is written by hand in one clause per line. */
const CHECKED_DIRECTORIES = ["skills", "docs"];

/**
 * Collects Markdown files below the checked directories.
 * @param {string} root repository root
 * @returns {string[]} absolute paths in sorted order
 */
export const collectMarkdownFiles = (root) => {
  /** @type {string[]} */
  const files = [];
  /** @param {string} directory */
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === "node_modules") {
        continue;
      }
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(path);
      } else if (entry.name.endsWith(".md")) {
        let index = 0;
        while (index < files.length && (files[index] ?? "").localeCompare(path) < 0) {
          index += 1;
        }
        files.splice(index, 0, path);
      }
    }
  };
  for (const name of CHECKED_DIRECTORIES) {
    const directory = join(root, name);
    if (existsSync(directory)) {
      walk(directory);
    }
  }
  return files;
};

/**
 * Measures the prose of a line. Link targets and bare URLs cannot be broken,
 * so they do not count.
 * @param {string} line
 * @returns {number}
 */
export const proseLength = (line) => {
  const withoutTargets = line
    .replaceAll(/\]\([^)\s]+\)/gu, "]()")
    .replaceAll(/https?:\/\/\S+/gu, "");
  return Array.from(withoutTargets).length;
};

/**
 * Finds prose lines longer than the limit. Fenced code and table rows are
 * exempt because their layout is not prose.
 * @param {string} contents
 * @param {number} [limit]
 * @returns {{ line: number, length: number }[]}
 */
export const findLongLines = (contents, limit = MAX_LINE_LENGTH) => {
  /** @type {{ line: number, length: number }[]} */
  const findings = [];
  /** @type {string | null} */
  let fence = null;
  contents.split("\n").forEach((text, index) => {
    const fenceMatch = text.match(/^\s*(`{3,}|~{3,})/u);
    if (fenceMatch) {
      if (fence === null) {
        fence = fenceMatch[1][0];
      } else if (fenceMatch[1][0] === fence) {
        fence = null;
      }
      return;
    }
    if (fence !== null || /^\s*\|/u.test(text)) {
      return;
    }
    const length = proseLength(text);
    if (length > limit) {
      findings.push({ line: index + 1, length });
    }
  });
  return findings;
};

/**
 * Checks the Markdown files under the checked directories, `skills/` and `docs/`.
 * @param {string} root repository root
 * @returns {{ files: number, errors: string[] }}
 */
export const checkRepository = (root) => {
  const files = collectMarkdownFiles(root);
  /** @type {string[]} */
  const errors = [];
  for (const file of files) {
    for (const finding of findLongLines(readFileSync(file, "utf8"))) {
      errors.push(
        `${relative(root, file)}:${finding.line} has ${finding.length} characters; ` +
          `break it at a clause (limit ${MAX_LINE_LENGTH})`,
      );
    }
  }
  return { files: files.length, errors };
};
