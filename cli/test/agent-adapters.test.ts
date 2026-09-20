import { assert, it } from "@effect/vitest";
import { Effect } from "effect";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { AgentSpec } from "../src/agent-adapters.js";
import {
  renderClaudeCode,
  renderCodex,
  renderCodexProfile,
  renderOpencode,
} from "../src/agent-adapters.js";
import { parseAgentSource } from "../src/agent-source.js";

const preloadedBody = "# Review It\n\nFind what the change breaks.\n";

const spec: AgentSpec = {
  name: "review-it",
  description: "Independently review a completed change.",
  instructions: "Activate the `review-it` skill.\nDo not modify anything.\n",
  preload: [{ name: "review-it", instructions: preloadedBody }],
  adapters: {
    "claude-code": {
      frontmatter: {
        tools: ["Read", "Grep"],
        permissionMode: "plan",
      },
    },
    opencode: {
      frontmatter: {
        mode: "subagent",
        permission: { skill: { "*": "deny", "review-it": "allow" } },
      },
    },
    codex: { frontmatter: { sandbox_mode: "read-only" } },
    "codex-profile": { description: "The user selected this profile." },
  },
};

const root = resolve(import.meta.dirname, "../..");
const read = (relative: string): string => readFileSync(join(root, relative), "utf8");

const aureliusDrive = (): AgentSpec =>
  Effect.runSync(
    parseAgentSource(
      read("agents/aurelius-drive/agent.yaml"),
      "aurelius-drive",
      read("agents/aurelius-drive/instructions.md"),
      new Map([
        ["aurelius", read("skills/engineering/aurelius/SKILL.md")],
        ["drive-it", read("skills/engineering/drive-it/SKILL.md")],
      ]),
    ),
  );

/** Reads back the single-line TOML basic string value, proving it parses. */
const developerInstructions = (toml: string): string => {
  const match = /^developer_instructions = (".*")$/mu.exec(toml);
  assert.isNotNull(match);
  const parsed: unknown = JSON.parse(match[1] ?? '""');
  return typeof parsed === "string" ? parsed : "";
};

const developerInstructionsLine = (toml: string): string => {
  const line = toml
    .split("\n")
    .find((candidate) => candidate.startsWith("developer_instructions = "));
  assert.isDefined(line);
  return line ?? "";
};

const hasRawControlCharacter = (value: string): boolean => {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.codePointAt(index) ?? 0;
    if (code <= 0x1f || code === 0x7f) {
      return true;
    }
  }
  return false;
};

it("claude adapter carries name, description, extra frontmatter, and inlines preload", () => {
  const out = renderClaudeCode(spec);
  assert.match(out, /^---\nname: review-it\n/u);
  assert.match(out, /description: Independently review a completed change\./u);
  assert.match(out, /permissionMode: plan/u);
  assert.notMatch(out, /^skills:/mu);
  assert.match(out, /Activate the `review-it` skill\./u);
  assert.match(out, /<!-- BEGIN preloaded skill: review-it -->/u);
  assert.match(out, /Find what the change breaks\./u);
  assert.match(out, /<!-- END preloaded skill: review-it -->/u);
});

it("opencode adapter embeds the canonical skill body between markers", () => {
  const out = renderOpencode(spec);
  assert.notMatch(out, /^name:/mu);
  assert.match(out, /mode: subagent/u);
  assert.match(out, /"\*": deny/u);
  assert.match(out, /<!-- BEGIN preloaded skill: review-it -->/u);
  assert.match(out, /Find what the change breaks\./u);
  assert.match(out, /<!-- END preloaded skill: review-it -->/u);
});

it("codex adapter is managed, named, and embeds instructions plus skill content", () => {
  const out = renderCodex(spec);
  assert.match(out, /^# Managed by typeweaver\/skills; do not edit/u);
  assert.match(out, /name = "review-it"/u);
  assert.match(out, /sandbox_mode = "read-only"/u);
  const value = developerInstructions(out);
  assert.match(value, /^Activate the `review-it` skill\./u);
  assert.match(value, /<!-- BEGIN preloaded skill: review-it -->/u);
  assert.match(value, /Find what the change breaks\./u);
});

it("codex profile prepends its description and embeds skill content", () => {
  const out = renderCodexProfile(spec);
  assert.match(out, /^developer_instructions = "/mu);
  assert.notMatch(out, /name = /u);
  const value = developerInstructions(out);
  assert.match(value, /^The user selected this profile\.\n\nActivate/u);
  assert.match(value, /<!-- BEGIN preloaded skill: review-it -->/u);
});

it("codex serializes developer_instructions as a valid TOML basic string", () => {
  const tricky: AgentSpec = {
    ...spec,
    instructions: 'Line "one".\nBackslash \\ and """ triple.\n',
    preload: [{ name: "review-it", instructions: 'Body with """ and \\ and\nnewline.' }],
  };
  const codex = renderCodex(tricky);
  const profile = renderCodexProfile(tricky);

  for (const out of [codex, profile]) {
    assert.notMatch(out, /"""/u);
    assert.isFalse(hasRawControlCharacter(developerInstructionsLine(out)));
    assert.match(out, /\\"\\"\\"/u);
    assert.match(out, /\\\\/u);
    assert.match(out, /\\n/u);
  }
  const codexValue = developerInstructions(codex);
  assert.isTrue(codexValue.includes('""" triple.'));
  assert.isTrue(codexValue.includes("Backslash \\ and"));
  assert.isTrue(codexValue.includes('Body with """ and \\ and\nnewline.'));
  assert.match(developerInstructions(profile), /The user selected this profile\./u);
});

it("rendering is deterministic", () => {
  assert.equal(renderClaudeCode(spec), renderClaudeCode(spec));
  assert.equal(renderOpencode(spec), renderOpencode(spec));
  assert.equal(renderCodex(spec), renderCodex(spec));
  assert.equal(renderCodexProfile(spec), renderCodexProfile(spec));
});

it("aurelius-drive inlines its preload on Claude with no native skills or initial prompt", () => {
  const out = renderClaudeCode(aureliusDrive());
  assert.notMatch(out, /^skills:/mu);
  assert.notMatch(out, /initialPrompt/u);
  assert.match(out, /<!-- BEGIN preloaded skill: aurelius -->/u);
  assert.match(out, /<!-- BEGIN preloaded skill: drive-it -->/u);
});

it("aurelius-drive inlines canonical aurelius and drive-it content on opencode and codex", () => {
  const opencode = renderOpencode(aureliusDrive());
  const codex = renderCodexProfile(aureliusDrive());
  for (const out of [opencode, codex]) {
    assert.match(out, /<!-- BEGIN preloaded skill: aurelius -->/u);
    assert.match(out, /<!-- BEGIN preloaded skill: drive-it -->/u);
    assert.match(out, /You are Aurelius, a senior engineer\./u);
    assert.match(out, /Take one outcome to a merged pull request/u);
    assert.notMatch(out, /^---\nname: aurelius/mu);
  }
});

it("inlined drive-it requires aurelius only when it is not already loaded", () => {
  const content = renderOpencode(aureliusDrive());
  assert.match(content, /unless `aurelius`\s+is already loaded in this session/u);
  assert.notMatch(content, /keep that mindset throughout\./u);
});

it("no aurelius-drive adapter forbids the skill loading drive-it routes to", () => {
  const opencode = renderOpencode(aureliusDrive());
  assert.match(opencode, /skill: allow/u);
  assert.notMatch(opencode, /"\*": deny/u);
});

it("committed aurelius-drive adapters match their canonical sources", () => {
  const current = aureliusDrive();
  assert.equal(renderClaudeCode(current), read("agents/aurelius-drive/claude.md"));
  assert.equal(renderOpencode(current), read("agents/aurelius-drive/opencode.md"));
  assert.equal(renderCodexProfile(current), read("agents/aurelius-drive/codex-profile.toml"));
});
