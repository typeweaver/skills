import { assert, it } from "@effect/vitest";
import { Effect, Result } from "effect";
import { parseAgentSource } from "../src/agent-source.js";

const skills = new Map<string, string>([
  ["aurelius", "---\nname: aurelius\ndescription: Stance.\n---\n\n# Aurelius\n\nBe candid.\n"],
  [
    "drive-it",
    "---\nname: drive-it\ndescription: Workflow.\n---\n\n# Drive It\n\nTake one idea to a merge.\n",
  ],
]);

const agentYaml = (body: string): string => `name: sample\ndescription: Sample agent.\n${body}`;

const parse = (body: string, sources: ReadonlyMap<string, string> = skills) =>
  Effect.runSync(
    Effect.result(parseAgentSource(agentYaml(body), "sample", "Do the task.\n", sources)),
  );

const linkFreeError = (body: string): string | undefined => {
  const result = parse(
    "preload:\n  - linked\nadapters:\n  codex-profile: {}\n",
    new Map([["linked", `# Linked\n\n${body}\n`]]),
  );
  return Result.isFailure(result) ? result.failure.message : undefined;
};

it("resolves preload names and strips the canonical frontmatter", () => {
  const result = parse("preload:\n  - aurelius\nadapters:\n  codex-profile: {}\n");
  assert.isTrue(Result.isSuccess(result));
  if (Result.isSuccess(result)) {
    assert.equal(result.success.preload.length, 1);
    assert.equal(result.success.preload[0]?.name, "aurelius");
    assert.isTrue(result.success.preload[0]?.instructions.startsWith("# Aurelius") === true);
    assert.notMatch(result.success.preload[0]?.instructions ?? "", /^---/u);
  }
});

it("defaults to no preloaded skills", () => {
  const result = parse("adapters:\n  codex-profile: {}\n");
  assert.isTrue(Result.isSuccess(result));
  if (Result.isSuccess(result)) {
    assert.equal(result.success.preload.length, 0);
  }
});

it("fails clearly on an unknown preload skill", () => {
  const result = parse("preload:\n  - typo-does-not-exist\nadapters:\n  codex-profile: {}\n");
  assert.isTrue(Result.isFailure(result));
  if (Result.isFailure(result)) {
    assert.match(result.failure.message, /unknown preload skill 'typo-does-not-exist'/u);
  }
});

it("fails clearly on a duplicate preload skill", () => {
  const result = parse("preload:\n  - aurelius\n  - aurelius\nadapters:\n  codex-profile: {}\n");
  assert.isTrue(Result.isFailure(result));
  if (Result.isFailure(result)) {
    assert.match(result.failure.message, /duplicate preload skill 'aurelius'/u);
  }
});

it("fails clearly when preload is not a list", () => {
  const result = parse("preload: aurelius\nadapters:\n  codex-profile: {}\n");
  assert.isTrue(Result.isFailure(result));
  if (Result.isFailure(result)) {
    assert.match(result.failure.message, /preload must be a list of skill names/u);
  }
});

it("rejects inline links and images, including nested and escaped labels", () => {
  for (const body of [
    "Read [the detail](references/detail.md).",
    "![diagram](images/diagram.png)",
    "Read [outer [inner]](references/detail.md).",
    "Read [escaped \\[label\\]](references/detail.md).",
    "Read [angle](<references/detail.md>).",
    'Read [titled](references/detail.md "Title").',
    "Read [absolute](https://example.com/detail.md).",
    "Read [anchor](#section).",
  ]) {
    assert.match(linkFreeError(body) ?? "", /must be link-free/u);
  }
});

it("rejects reference definitions, including containers and escaped labels", () => {
  for (const body of [
    "[ref]: references/detail.md",
    "  [ref]: references/detail.md",
    "[ref]: https://example.com/detail.md",
    "[ref]: <references/detail.md>",
    "[Foo*bar\\]]: my_(url)",
    "> [ref]: references/detail.md",
    "- [ref]: references/detail.md",
    "1. [ref]: references/detail.md",
  ]) {
    assert.match(linkFreeError(body) ?? "", /Markdown reference definition/u);
  }
});

it("rejects HTML href and src attributes in any case or quoting", () => {
  for (const [body, attribute] of [
    ['<a href="references/detail.md">detail</a>', /HTML 'href' attribute/u],
    ["<img src='images/diagram.png'>", /HTML 'src' attribute/u],
    ["<a href=references/detail.md>detail</a>", /HTML 'href' attribute/u],
    ['<a HREF="references/detail.md">detail</a>', /HTML 'href' attribute/u],
    ['<img Src = "images/diagram.png">', /HTML 'src' attribute/u],
  ] as const) {
    assert.match(linkFreeError(body) ?? "", attribute);
  }
});

it("rejects URI and email autolinks", () => {
  for (const [body, syntax] of [
    ["See <https://example.com/detail.md> for detail.", /URI autolink/u],
    ["Write to <mailto:team@example.com>.", /URI autolink/u],
    ["Write to <team@example.com>.", /email autolink/u],
    ["Call <tel:+15551234567>.", /URI autolink/u],
  ] as const) {
    assert.match(linkFreeError(body) ?? "", syntax);
  }
});

it("rejects link syntax inside fenced and inline code examples", () => {
  for (const body of [
    "```markdown\n[the detail](references/detail.md)\n```\n",
    "````\n[the detail](references/detail.md)\n```\n",
    "`[the detail](references/detail.md)`",
  ]) {
    assert.match(linkFreeError(body) ?? "", /must be link-free/u);
  }
});

it("accepts a link-free body", () => {
  const body = [
    "Read the reference material before you start.",
    "Call the Skill tool with `review-it` and follow its contract.",
    "Prefer the shorter option when the tradeoff is even.",
  ].join("\n");
  assert.isUndefined(linkFreeError(body));
});

it("rejects claude-code frontmatter.skills that overlap preload", () => {
  const result = parse(
    "preload:\n  - aurelius\nadapters:\n  claude-code:\n    frontmatter:\n      skills:\n        - aurelius\n",
  );
  assert.isTrue(Result.isFailure(result));
  if (Result.isFailure(result)) {
    assert.match(result.failure.message, /duplicates the inlined preload: aurelius/u);
  }
});

it("accepts disjoint claude-code frontmatter.skills", () => {
  const result = parse(
    "preload:\n  - aurelius\nadapters:\n  claude-code:\n    frontmatter:\n      skills:\n        - review-it\n",
  );
  assert.isTrue(Result.isSuccess(result));
  if (Result.isSuccess(result)) {
    assert.equal(result.success.preload.length, 1);
  }
});

it("rejects a non-list claude-code frontmatter.skills", () => {
  const result = parse(
    "preload:\n  - aurelius\nadapters:\n  claude-code:\n    frontmatter:\n      skills: review-it\n",
  );
  assert.isTrue(Result.isFailure(result));
  if (Result.isFailure(result)) {
    assert.match(result.failure.message, /must be a list of skill names/u);
  }
});
