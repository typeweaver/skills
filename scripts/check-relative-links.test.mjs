import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, test } from "node:test";

import {
  checkRepository,
  collectMarkdownFiles,
  decodeCharacterReferences,
  extractInlineLinks,
} from "./relative-links.mjs";

/** @type {string[]} */
const temporaryDirectories = [];

/** @returns {string} */
const makeTemporaryDirectory = () => {
  const directory = mkdtempSync(join(tmpdir(), "relative-links-"));
  temporaryDirectories.push(directory);
  return directory;
};

/**
 * Creates a throwaway repository root with the directories the checker walks.
 * @param {string} [parent]
 * @returns {string}
 */
const makeRepository = (parent = makeTemporaryDirectory()) => {
  const root = join(parent, "repo");
  mkdirSync(join(root, "skills"), { recursive: true });
  mkdirSync(join(root, "agents"), { recursive: true });
  writeFileSync(join(root, "README.md"), "# Fixture\n");
  return root;
};

/**
 * @param {string} root
 * @param {string} path repository-relative path
 * @param {string} contents
 * @returns {string}
 */
const writeFixture = (root, path, contents) => {
  const file = join(root, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents);
  return file;
};

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

void test("extractInlineLinks reads links and ignores code containers", () => {
  const markdown = [
    "See [guide](docs/guide.md) and ![img](img.png).",
    "",
    "> [quoted](quoted.md)",
    "",
    "- [listed](listed.md)",
    "",
    "1. [ordered](ordered.md)",
    "",
    "```markdown",
    "[fenced](missing-fenced.md)",
    "```",
    "",
    "Inline `[inline](missing-inline.md)` code.",
    "",
    "    [indented](missing-indented.md)",
    "",
  ].join("\n");

  assert.deepEqual(extractInlineLinks(markdown), [
    "docs/guide.md",
    "img.png",
    "quoted.md",
    "listed.md",
    "ordered.md",
  ]);
});

void test("checkRepository resolves valid local link syntax", () => {
  const root = makeRepository();
  writeFixture(
    root,
    "skills/a/SKILL.md",
    "[plain](references/plain.md)\n[angle](<references/angle file.md>)\n" +
      '[title](references/plain.md "t")\n[query](references/plain.md?raw=1)\n' +
      "[fragment](references/plain.md#top)",
  );
  writeFixture(root, "skills/a/references/plain.md", "# plain\n");
  writeFixture(root, "skills/a/references/angle file.md", "# angle\n");

  assert.deepEqual(checkRepository(root), { checked: 5, errors: [] });
});

void test("checkRepository reports a missing target", () => {
  const root = makeRepository();
  writeFixture(root, "skills/a/SKILL.md", "See [gone](./gone.md).\n");

  assert.deepEqual(checkRepository(root), {
    checked: 1,
    errors: [{ file: "skills/a/SKILL.md", target: "./gone.md", reason: "missing" }],
  });
});

void test("checkRepository decodes encoded targets and survives malformed ones", () => {
  const root = makeRepository();
  writeFixture(
    root,
    "skills/a/SKILL.md",
    "[space](My%20Guide.md)\n[entity](Tom&amp;Jerry.md)\n[malformed](broken%E0%A4%A.md)\n" +
      "[scheme](https&#58;//example.com/missing.md)\n[root](&#47;absolute/missing.md)",
  );
  writeFixture(root, "skills/a/My Guide.md", "# guide\n");
  writeFixture(root, "skills/a/Tom&Jerry.md", "# toon\n");

  assert.deepEqual(checkRepository(root), {
    checked: 3,
    errors: [{ file: "skills/a/SKILL.md", target: "broken%E0%A4%A.md", reason: "missing" }],
  });
});

void test("decodes CommonMark character references and gates overlong numerics", () => {
  assert.equal(decodeCharacterReferences("&amp;&sol;&period;&period;"), "&/..");
  assert.equal(decodeCharacterReferences("&AMP;"), "&");
  assert.equal(decodeCharacterReferences("&#46;&#x2E;&#0000046;"), "...");
  assert.equal(decodeCharacterReferences("&NotEqualTilde;"), "\u2242\u0338");
  assert.equal(decodeCharacterReferences("&notit;"), "&notit;");
  assert.equal(decodeCharacterReferences("&#00000046;&#x000002E;"), "&#00000046;&#x000002E;");
});

void test("rejects entity-encoded traversal outside the repository", () => {
  const parent = makeTemporaryDirectory();
  const root = makeRepository(parent);
  writeFileSync(join(parent, "outside.md"), "# outside\n");
  const target = "&period;&period;&sol;&period;&period;&sol;&period;&period;&sol;outside.md";
  writeFixture(root, "skills/a/SKILL.md", `[out](${target})\n`);

  assert.deepEqual(checkRepository(root), {
    checked: 1,
    errors: [{ file: "skills/a/SKILL.md", target, reason: "outside" }],
  });
});

void test("rejects targets that resolve outside the repository", () => {
  const parent = makeTemporaryDirectory();
  const root = makeRepository(parent);
  writeFixture(root, "skills/a/SKILL.md", "[outside](../../../outside.md)\n");
  writeFileSync(join(parent, "outside.md"), "# outside\n");

  assert.deepEqual(checkRepository(root), {
    checked: 1,
    errors: [{ file: "skills/a/SKILL.md", target: "../../../outside.md", reason: "outside" }],
  });
});

void test("scans skills, agents, and the root README with POSIX paths", () => {
  const root = makeRepository();
  writeFixture(root, "skills/a/SKILL.md", "[missing](missing-skill.md)\n");
  writeFixture(root, "agents/a/instructions.md", "[missing](missing-agent.md)\n");
  writeFixture(root, "README.md", "[missing](missing-readme.md)\n");

  const files = checkRepository(root).errors.map((error) => error.file);
  assert.deepEqual(files, ["skills/a/SKILL.md", "agents/a/instructions.md", "README.md"]);
  assert.deepEqual(
    files.filter((file) => file.includes("\\")),
    [],
  );
});

void test("location placeholders are exempt only in the plan template", () => {
  const exempt = makeRepository();
  writeFixture(exempt, "skills/engineering/plan-it/assets/plan-template.md", "[plan](location)\n");
  assert.deepEqual(checkRepository(exempt), { checked: 0, errors: [] });

  const flagged = makeRepository();
  writeFixture(flagged, "skills/a/SKILL.md", "[plan](location)\n");
  assert.deepEqual(checkRepository(flagged), {
    checked: 1,
    errors: [{ file: "skills/a/SKILL.md", target: "location", reason: "missing" }],
  });
});

void test("does not traverse symlinked directories when collecting Markdown", (t) => {
  const root = makeRepository();
  const outside = makeTemporaryDirectory();
  writeFileSync(join(outside, "secret.md"), "# outside\n");
  try {
    symlinkSync(outside, join(root, "skills", "linked"), "dir");
  } catch {
    t.skip("symlinks are not permitted on this platform");
    return;
  }

  assert.deepEqual(collectMarkdownFiles(root), [join(root, "README.md")]);
});

void test("rejects existing targets that symlink outside the repository", (t) => {
  const parent = makeTemporaryDirectory();
  const root = makeRepository(parent);
  const outside = join(parent, "outside");
  mkdirSync(outside, { recursive: true });
  writeFileSync(join(outside, "target.md"), "# outside\n");
  try {
    symlinkSync(outside, join(root, "skills", "escape"), "dir");
  } catch {
    t.skip("symlinks are not permitted on this platform");
    return;
  }
  writeFixture(root, "skills/a/SKILL.md", "[out](../escape/target.md)\n");

  assert.deepEqual(checkRepository(root), {
    checked: 1,
    errors: [{ file: "skills/a/SKILL.md", target: "../escape/target.md", reason: "outside" }],
  });
});

void test("accepts symlinks that resolve inside the repository", (t) => {
  const root = makeRepository();
  writeFixture(root, "skills/b/target.md", "# inside\n");
  try {
    symlinkSync(join(root, "skills", "b"), join(root, "skills", "alias"), "dir");
  } catch {
    t.skip("symlinks are not permitted on this platform");
    return;
  }
  writeFixture(root, "skills/a/SKILL.md", "[in](../alias/target.md)\n");

  assert.deepEqual(checkRepository(root), { checked: 1, errors: [] });
});
