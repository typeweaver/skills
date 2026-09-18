import { assert, it } from "@effect/vitest";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { AgentSpec } from "../src/agent-adapters.js";
import {
  renderClaudeCode,
  renderCodex,
  renderCodexProfile,
  renderOpencode,
} from "../src/agent-adapters.js";

const spec: AgentSpec = {
  name: "review-it",
  description: "Independently review a completed change.",
  instructions: "Activate the `review-it` skill.\nDo not modify anything.\n",
  adapters: {
    "claude-code": {
      frontmatter: {
        tools: ["Read", "Grep"],
        skills: ["review-it"],
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

it("claude adapter carries name, description, and extra frontmatter", () => {
  const out = renderClaudeCode(spec);
  assert.match(out, /^---\nname: review-it\n/u);
  assert.match(out, /description: Independently review a completed change\./u);
  assert.match(out, /permissionMode: plan/u);
  assert.match(out, /Activate the `review-it` skill\./u);
  assert.isOk(out.endsWith("Do not modify anything.\n"));
});

it("opencode adapter has no name but keeps mode and permissions", () => {
  const out = renderOpencode(spec);
  assert.notMatch(out, /^name:/mu);
  assert.match(out, /mode: subagent/u);
  assert.match(out, /"\*": deny/u);
});

it("codex adapter is managed, named, and embeds the instructions", () => {
  const out = renderCodex(spec);
  assert.match(out, /^# Managed by typeweaver\/skills; do not edit/u);
  assert.match(out, /name = "review-it"/u);
  assert.match(out, /sandbox_mode = "read-only"/u);
  assert.match(out, /developer_instructions = """\nActivate/u);
});

it("codex profile prepends its description to the shared instructions", () => {
  const out = renderCodexProfile(spec);
  assert.match(out, /The user selected this profile\.\n\nActivate/u);
  assert.notMatch(out, /name = /u);
});

it("rendering is deterministic", () => {
  assert.equal(renderClaudeCode(spec), renderClaudeCode(spec));
  assert.equal(renderCodex(spec), renderCodex(spec));
});

it("aurelius-drive starts drive-it from agent selection on every harness", () => {
  const root = resolve(import.meta.dirname, "../..");
  const read = (relative: string): string => readFileSync(join(root, relative), "utf8");
  const instructions = read("agents/aurelius-drive/instructions.md");
  const claude = read("agents/aurelius-drive/claude.md");

  assert.match(instructions, /Do not call the Skill tool with\s+`drive-it`/u);
  assert.match(instructions, /Start a subagent only/u);
  assert.match(claude, /initialPrompt: \/drive-it/u);
  assert.match(claude, /skills:\n {2}- aurelius\n {2}- drive-it/u);
  assert.match(read("agents/aurelius-drive/opencode.md"), /mode: primary/u);
  assert.match(
    read("agents/aurelius-drive/codex-profile.toml"),
    /Do not call the Skill tool with\s+`drive-it`/u,
  );
});
