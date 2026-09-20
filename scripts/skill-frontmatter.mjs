import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";
import { parse } from "yaml";

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u;

/** @type {(value: unknown) => value is Record<string, unknown>} */
const isMapping = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * @param {unknown} error
 * @returns {string}
 */
const describe = (error) => (error instanceof Error ? error.message : String(error));

/**
 * @param {string} source
 * @returns {{ ok: true, value: Record<string, unknown> } | { ok: false, message: string }}
 */
const parseMapping = (source) => {
  /** @type {unknown} */
  let value;
  try {
    value = parse(source);
  } catch (error) {
    return { ok: false, message: `invalid YAML: ${describe(error)}` };
  }
  return isMapping(value) ? { ok: true, value } : { ok: false, message: "not a mapping" };
};

/**
 * @param {Record<string, unknown>} mapping
 * @param {string[]} fields
 * @param {string} [prefix]
 * @returns {string[]}
 */
const requiredStrings = (mapping, fields, prefix = "") => {
  /** @type {string[]} */
  const errors = [];
  for (const field of fields) {
    const value = mapping[field];
    if (typeof value !== "string" || value.length === 0) {
      errors.push(`${prefix}${field} must be a non-empty string`);
    }
  }
  return errors;
};

/**
 * Parses a `SKILL.md` document and reports field problems. The parsed `name` is
 * returned as a plain YAML value so quoted values and trailing comments resolve
 * to the same string as an unquoted value.
 *
 * @param {string} text
 * @returns {{ name: string | undefined, errors: string[] }}
 */
const readSkill = (text) => {
  const match = text.match(FRONTMATTER_PATTERN);
  if (match === null) {
    return { name: undefined, errors: ["missing YAML frontmatter"] };
  }
  const parsed = parseMapping(match[1]);
  if (!parsed.ok) {
    return { name: undefined, errors: [`frontmatter: ${parsed.message}`] };
  }
  const name = parsed.value["name"];
  return {
    name: typeof name === "string" && name.length > 0 ? name : undefined,
    errors: requiredStrings(parsed.value, ["name", "description"]),
  };
};

/**
 * Validates a `SKILL.md` document: required YAML frontmatter that is a mapping
 * with non-empty string `name` and `description` fields.
 *
 * @param {string} text
 * @returns {string[]} one message per problem; empty when the document is valid.
 */
export const validateSkillDocument = (text) => readSkill(text).errors;

/**
 * Validates an `agents/openai.yaml` document: a mapping whose `interface` is a
 * mapping with non-empty string `display_name`, `short_description`, and
 * `default_prompt` fields.
 *
 * @param {string} text
 * @returns {string[]} one message per problem; empty when the document is valid.
 */
export const validateOpenaiDocument = (text) => {
  const parsed = parseMapping(text);
  if (!parsed.ok) {
    return [parsed.message];
  }
  const iface = parsed.value["interface"];
  if (!isMapping(iface)) {
    return ["interface must be a mapping"];
  }
  return requiredStrings(
    iface,
    ["display_name", "short_description", "default_prompt"],
    "interface.",
  );
};

/**
 * @param {string} root
 * @param {string} path
 * @returns {string}
 */
const toPosix = (root, path) => relative(root, path).split(sep).join("/");

/**
 * Orders paths lexicographically so scan output and duplicate reporting do not
 * depend on the filesystem's directory iteration order.
 *
 * @param {string[]} paths
 * @returns {string[]}
 */
const sortPaths = (paths) => {
  /** @type {string[]} */
  const sorted = [];
  for (const path of paths) {
    let index = 0;
    while (index < sorted.length && (sorted[index] ?? "").localeCompare(path) < 0) {
      index += 1;
    }
    sorted.splice(index, 0, path);
  }
  return sorted;
};

/**
 * @param {string} root
 * @param {(path: string) => boolean} matches
 * @returns {string[]}
 */
const collectFiles = (root, matches) => {
  /** @type {string[]} */
  const found = [];
  /** @param {string} directory */
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(path);
      } else if (matches(toPosix(root, path))) {
        found.push(path);
      }
    }
  };
  visit(root);
  return sortPaths(found);
};

/**
 * Scans `skills/` for `SKILL.md` files (any depth) and `agents/openai.yaml`
 * metadata files, then validates each document, the skill-name/directory
 * identity, and global skill-name uniqueness.
 *
 * @param {string} repoDir
 * @returns {{ skills: number, metadata: number, errors: string[] }}
 */
export const validateRepository = (repoDir) => {
  const skillsDir = join(repoDir, "skills");
  const skillFiles = collectFiles(
    skillsDir,
    (path) => path === "SKILL.md" || path.endsWith("/SKILL.md"),
  );
  const metadataFiles = collectFiles(skillsDir, (path) => path.endsWith("/agents/openai.yaml"));
  /** @type {string[]} */
  const errors = [];
  /** @type {Map<string, string>} */
  const firstByName = new Map();
  for (const path of skillFiles) {
    const label = toPosix(repoDir, path);
    const { name, errors: documentErrors } = readSkill(readFileSync(path, "utf8"));
    errors.push(...documentErrors.map((message) => `${label}: ${message}`));
    if (name === undefined) {
      continue;
    }
    const directory = basename(dirname(path));
    if (name !== directory) {
      errors.push(`${label}: name '${name}' does not match directory '${directory}'`);
    }
    const first = firstByName.get(name);
    if (first === undefined) {
      firstByName.set(name, label);
    } else {
      errors.push(`${label}: duplicate skill name '${name}' (first declared in ${first})`);
    }
  }
  for (const path of metadataFiles) {
    for (const message of validateOpenaiDocument(readFileSync(path, "utf8"))) {
      errors.push(`${toPosix(repoDir, path)}: ${message}`);
    }
  }
  return { skills: skillFiles.length, metadata: metadataFiles.length, errors };
};
