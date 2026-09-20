import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import {
  validateOpenaiDocument,
  validateRepository,
  validateSkillDocument,
} from "../skill-frontmatter.mjs";

const skillDocument = (frontmatter) => `---\n${frontmatter}\n---\n\n# Example\n`;

const VALID_SKILL = skillDocument(
  "name: example\ndescription: First line\n  second line\n  third line",
);

/**
 * @param {Record<string, string | undefined>} [overrides]
 * @returns {string}
 */
const openaiDocument = (overrides = {}) => {
  /** @type {Record<string, string | undefined>} */
  const fields = {
    display_name: '"Example"',
    short_description: '"A short description"',
    default_prompt: '"Use $example."',
    ...overrides,
  };
  const lines = Object.entries(fields)
    .filter(([, value]) => value !== undefined)
    .map(([field, value]) => `  ${field}: ${value ?? ""}`);
  return `interface:\n${lines.join("\n")}\n`;
};

const VALID_OPENAI = openaiDocument();

/**
 * @param {Record<string, string>} files
 * @returns {string}
 */
const createRepo = (files) => {
  const root = mkdtempSync(join(tmpdir(), "skill-frontmatter-"));
  for (const [path, contents] of Object.entries(files)) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, contents);
  }
  return root;
};

/**
 * @param {import("node:test").TestContext} context
 * @param {Record<string, string>} files
 * @returns {{ skills: number, metadata: number, errors: string[] }}
 */
const validateRepo = (context, files) => {
  const root = createRepo(files);
  context.after(() => {
    rmSync(root, { recursive: true, force: true });
  });
  return validateRepository(root);
};

void test("accepts valid multiline frontmatter", () => {
  assert.deepEqual(validateSkillDocument(VALID_SKILL), []);
});

void test("rejects a mapping continuation inside a scalar", () => {
  const errors = validateSkillDocument(
    skillDocument("name: example\ndescription: First line\n  nested: value"),
  );
  assert.equal(errors.length, 1);
  assert.match(errors[0] ?? "", /invalid YAML/u);
});

void test("rejects missing frontmatter", () => {
  assert.deepEqual(validateSkillDocument("# No frontmatter\n"), ["missing YAML frontmatter"]);
});

void test("rejects non-mapping frontmatter", () => {
  assert.deepEqual(validateSkillDocument(skillDocument("- one\n- two")), [
    "frontmatter: not a mapping",
  ]);
  assert.deepEqual(validateSkillDocument(skillDocument("just a scalar")), [
    "frontmatter: not a mapping",
  ]);
});

void test("rejects missing, empty, and wrong-typed skill fields", () => {
  const cases = [
    ["description: ok", "name must be a non-empty string"],
    ['name: ""\ndescription: ok', "name must be a non-empty string"],
    ["name: 123\ndescription: ok", "name must be a non-empty string"],
    ["name: [example]\ndescription: ok", "name must be a non-empty string"],
    ["name: example", "description must be a non-empty string"],
    ['name: example\ndescription: ""', "description must be a non-empty string"],
    ["name: example\ndescription: [one, two]", "description must be a non-empty string"],
  ];
  for (const [frontmatter, expected] of cases) {
    assert.deepEqual(validateSkillDocument(skillDocument(frontmatter)), [expected]);
  }
});

void test("accepts valid openai.yaml metadata", () => {
  assert.deepEqual(validateOpenaiDocument(VALID_OPENAI), []);
});

void test("rejects malformed openai.yaml", () => {
  assert.match(validateOpenaiDocument("interface: [unclosed\n")[0] ?? "", /invalid YAML/u);
  assert.deepEqual(validateOpenaiDocument("- one\n- two\n"), ["not a mapping"]);
  assert.deepEqual(validateOpenaiDocument("interface: text\n"), ["interface must be a mapping"]);
});

void test("rejects missing, empty, and wrong-typed openai.yaml fields", () => {
  const cases = [
    [
      openaiDocument({ display_name: undefined }),
      "interface.display_name must be a non-empty string",
    ],
    [openaiDocument({ display_name: '""' }), "interface.display_name must be a non-empty string"],
    [openaiDocument({ display_name: "5" }), "interface.display_name must be a non-empty string"],
    [
      openaiDocument({ short_description: undefined }),
      "interface.short_description must be a non-empty string",
    ],
    [
      openaiDocument({ short_description: '""' }),
      "interface.short_description must be a non-empty string",
    ],
    [
      openaiDocument({ short_description: "[one]" }),
      "interface.short_description must be a non-empty string",
    ],
    [
      openaiDocument({ default_prompt: undefined }),
      "interface.default_prompt must be a non-empty string",
    ],
    [
      openaiDocument({ default_prompt: '""' }),
      "interface.default_prompt must be a non-empty string",
    ],
    [
      openaiDocument({ default_prompt: "[one]" }),
      "interface.default_prompt must be a non-empty string",
    ],
  ];
  for (const [document, expected] of cases) {
    assert.deepEqual(validateOpenaiDocument(document), [expected]);
  }
});

void test("accepts quoted and commented skill names", (t) => {
  const report = validateRepo(t, {
    "skills/quoted/SKILL.md": skillDocument('name: "quoted"\ndescription: A skill'),
    "skills/commented/SKILL.md": skillDocument(
      "name: commented # trailing note\ndescription: A skill",
    ),
  });
  assert.deepEqual(report, { skills: 2, metadata: 0, errors: [] });
});

void test("reports a skill name that does not match its directory", (t) => {
  const report = validateRepo(t, {
    "skills/other/SKILL.md": skillDocument("name: actual\ndescription: A skill"),
  });
  assert.deepEqual(report.errors, [
    "skills/other/SKILL.md: name 'actual' does not match directory 'other'",
  ]);
});

void test("reports duplicate skill names deterministically", (t) => {
  const report = validateRepo(t, {
    "skills/b/example/SKILL.md": skillDocument("name: example\ndescription: A skill"),
    "skills/a/example/SKILL.md": skillDocument("name: example\ndescription: A skill"),
  });
  assert.deepEqual(report.errors, [
    "skills/b/example/SKILL.md: duplicate skill name 'example' (first declared in skills/a/example/SKILL.md)",
  ]);
});

void test("scans only SKILL.md and agents/openai.yaml below skills", (t) => {
  const report = validateRepo(t, {
    "skills/example/SKILL.md": VALID_SKILL,
    "skills/example/agents/openai.yaml": VALID_OPENAI,
    "skills/example/README.md": "# Example\n",
    "skills/example/SKILL.md.bak": "not frontmatter\n",
    "skills/example/openai.yaml": "not: metadata\n",
    "skills/example/references/openai.yaml": "not: metadata\n",
  });
  assert.deepEqual(report, { skills: 1, metadata: 1, errors: [] });
});

void test("reports invalid documents with repository-relative paths", (t) => {
  const report = validateRepo(t, {
    "skills/broken/SKILL.md": skillDocument("name: broken"),
    "skills/broken/agents/openai.yaml": "interface: text\n",
  });
  assert.deepEqual(report, {
    skills: 1,
    metadata: 1,
    errors: [
      "skills/broken/SKILL.md: description must be a non-empty string",
      "skills/broken/agents/openai.yaml: interface must be a mapping",
    ],
  });
});
