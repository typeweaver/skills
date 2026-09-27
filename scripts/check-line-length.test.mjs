import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, test } from "node:test";

import { checkRepository, findLongLines, proseLength } from "./line-length.mjs";

/** @type {string[]} */
const temporaryDirectories = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

const longProse = `${"word ".repeat(30)}end.`;

void test("flags a prose line over the limit and reports its length", () => {
  const findings = findLongLines(`# Title\n\n${longProse}\nShort line.\n`);
  assert.deepEqual(findings, [{ line: 3, length: proseLength(longProse) }]);
});

void test("exempts fenced code and table rows", () => {
  const contents = ["```text", longProse, "```", `| ${longProse} |`, "~~~", longProse, "~~~"].join(
    "\n",
  );
  assert.deepEqual(findLongLines(contents), []);
});

void test("does not count link targets and bare URLs", () => {
  const url = `https://example.com/${"a".repeat(200)}`;
  assert.deepEqual(findLongLines(`- [Source](${url}) — a short note.\n${url}\n`), []);
  assert.deepEqual(findLongLines(`[${"x".repeat(121)}](${url})\n`), [{ line: 1, length: 125 }]);
});

void test("checks skills and docs but not generated adapters", () => {
  const root = mkdtempSync(join(tmpdir(), "line-length-"));
  temporaryDirectories.push(root);
  mkdirSync(join(root, "skills", "engineering", "example"), { recursive: true });
  mkdirSync(join(root, "docs"), { recursive: true });
  mkdirSync(join(root, "agents", "example"), { recursive: true });
  writeFileSync(
    join(root, "skills", "engineering", "example", "SKILL.md"),
    `# Example\n\n${longProse}\n`,
  );
  writeFileSync(join(root, "docs", "guide.md"), "# Guide\n\nShort.\n");
  writeFileSync(join(root, "agents", "example", "claude.md"), `${longProse}\n`);

  const report = checkRepository(root);
  assert.equal(report.files, 2);
  assert.deepEqual(report.errors, [
    `skills/engineering/example/SKILL.md:3 has ${proseLength(longProse)} characters; break it at a clause (limit 120)`,
  ]);
});
