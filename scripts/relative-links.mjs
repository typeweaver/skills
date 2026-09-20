/**
 * Checks local inline Markdown link targets in repository files.
 *
 * Parsing is delegated to `marked`, whose token stream ignores code blocks and
 * spans and understands ordinary CommonMark containers (block quotes, lists,
 * tables). One marked deviation is accepted and documented rather than worked
 * around: an unclosed fence opened inside a list item may extend to the end of
 * the document instead of ending with the list item.
 *
 * Character references are decoded with `entities` behind a CommonMark gate
 * (1-7 decimal or 1-6 hexadecimal digits). Targets resolve relative to the
 * containing file after query and fragment suffixes are stripped and
 * percent-encoding is decoded; malformed encodings fall back to the raw target.
 *
 * Symlinked directories are never traversed when collecting Markdown, and an
 * existing target is accepted only when its canonical path stays inside the
 * canonical repository root, so an in-repository symlink cannot escape it.
 * @module
 */
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";

import { decodeHTMLStrict } from "entities";
import { lexer, walkTokens } from "marked";

/** Markdown file whose placeholder `location` targets are not real links. */
export const LOCATION_EXEMPT_FILE = "skills/engineering/plan-it/assets/plan-template.md";

/**
 * CommonMark character reference: named HTML5, 1-7 decimal digits, or 1-6
 * hexadecimal digits. Overlong numeric references stay literal.
 * @type {RegExp}
 */
const CHARACTER_REFERENCE = /&(?:#[0-9]{1,7}|#[xX][0-9a-fA-F]{1,6}|[a-zA-Z][a-zA-Z0-9]*);/gu;

/** @param {string} path @returns {string | null} canonical path, or null when unresolved */
const realpathOrNull = (path) => {
  try {
    return realpathSync(path);
  } catch {
    return null;
  }
};

/** @param {string} path @returns {string} */
const toPosix = (path) => path.replaceAll("\\", "/");

/** @param {string} base @param {string} candidate @returns {boolean} */
const isInside = (base, candidate) => {
  const rel = toPosix(relative(base, candidate));
  return rel === "" || (!rel.startsWith("../") && rel !== ".." && !isAbsolute(rel));
};

/** @param {string} repoDir @param {string} target @returns {boolean} */
const resolvesInside = (repoDir, target) => {
  const realRepoDir = realpathOrNull(repoDir);
  const realTarget = realpathOrNull(target);
  return realRepoDir !== null && realTarget !== null && isInside(realRepoDir, realTarget);
};

/**
 * Decodes CommonMark character references. The gate enforces the CommonMark
 * numeric length limits and `entities` validates the HTML5 named table;
 * references that are not decodable are returned unchanged.
 * @param {string} target
 * @returns {string}
 */
export const decodeCharacterReferences = (target) =>
  target.replace(CHARACTER_REFERENCE, (reference) => decodeHTMLStrict(reference));

/** @param {string} path @returns {string} the percent-decoded path, or the input when malformed */
const decodePercentEncoding = (path) => {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
};

/** @param {string} target @returns {boolean} */
const isNonFileTarget = (target) =>
  target.length === 0 ||
  target.startsWith("#") ||
  target.startsWith("/") ||
  /^[a-z][a-z0-9+.-]*:/iu.test(target);

/** @param {string} target @returns {string} */
const stripQueryAndFragment = (target) => {
  const cut = target.search(/[?#]/u);
  return cut === -1 ? target : target.slice(0, cut);
};

/**
 * Extracts inline link and image destinations in document order.
 * @param {string} markdown
 * @returns {string[]}
 */
export const extractInlineLinks = (markdown) => {
  /** @type {string[]} */
  const targets = [];
  // walkTokens is synchronous in marked but typed as returning maybe-promises.
  void walkTokens(lexer(markdown), (token) => {
    if ((token.type === "link" || token.type === "image") && typeof token.href === "string") {
      targets.push(token.href);
    }
  });
  return targets;
};

/**
 * @param {string} file absolute path to a Markdown file
 * @param {string} repoDir repository root used for reporting and exemptions
 * @returns {{ checked: number, errors: { file: string, target: string, reason: string }[] }}
 */
export const checkMarkdownFile = (file, repoDir) => {
  const reportedFile = toPosix(relative(repoDir, file));
  const exemptLocation = reportedFile === LOCATION_EXEMPT_FILE;
  /** @type {{ file: string, target: string, reason: string }[]} */
  const errors = [];
  let checked = 0;
  for (const target of extractInlineLinks(readFileSync(file, "utf8"))) {
    const path = stripQueryAndFragment(decodeCharacterReferences(target));
    if (isNonFileTarget(path) || (exemptLocation && path === "location")) {
      continue;
    }
    checked += 1;
    const resolved = resolve(dirname(file), decodePercentEncoding(path));
    if (!isInside(repoDir, resolved)) {
      errors.push({ file: reportedFile, target, reason: "outside" });
    } else if (!existsSync(resolved)) {
      errors.push({ file: reportedFile, target, reason: "missing" });
    } else if (!resolvesInside(repoDir, resolved)) {
      errors.push({ file: reportedFile, target, reason: "outside" });
    }
  }
  return { checked, errors };
};

/**
 * Collects Markdown below `skills/` and `agents/` plus the root README.
 * Symlinked directories are not traversed; a symlinked container that resolves
 * outside the repository is skipped.
 * @param {string} repoDir
 * @returns {string[]}
 */
export const collectMarkdownFiles = (repoDir) => {
  /** @type {string[]} */
  const files = [];
  /** @param {string} directory */
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(path);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(path);
      }
    }
  };
  for (const container of ["skills", "agents"]) {
    const directory = join(repoDir, container);
    if (resolvesInside(repoDir, directory)) {
      walk(directory);
    }
  }
  files.push(join(repoDir, "README.md"));
  return files;
};

/**
 * @param {string} repoDir
 * @returns {{ checked: number, errors: { file: string, target: string, reason: string }[] }}
 */
export const checkRepository = (repoDir) => {
  /** @type {{ file: string, target: string, reason: string }[]} */
  const errors = [];
  let checked = 0;
  for (const file of collectMarkdownFiles(repoDir)) {
    const result = checkMarkdownFile(file, repoDir);
    errors.push(...result.errors);
    checked += result.checked;
  }
  return { checked, errors };
};
