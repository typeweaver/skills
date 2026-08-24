import assert from "node:assert/strict";
import { test } from "node:test";
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

test("claude adapter carries name, description, and extra frontmatter", () => {
  const out = renderClaudeCode(spec);
  assert.match(out, /^---\nname: review-it\n/);
  assert.match(out, /description: Independently review a completed change\./);
  assert.match(out, /permissionMode: plan/);
  assert.match(out, /Activate the `review-it` skill\./);
  assert.ok(out.endsWith("Do not modify anything.\n"));
});

test("opencode adapter has no name but keeps mode and permissions", () => {
  const out = renderOpencode(spec);
  assert.doesNotMatch(out, /^name:/m);
  assert.match(out, /mode: subagent/);
  assert.match(out, /"\*": deny/);
});

test("codex adapter is managed, named, and embeds the instructions", () => {
  const out = renderCodex(spec);
  assert.match(out, /^# Managed by typeweaver\/skills; do not edit/);
  assert.match(out, /name = "review-it"/);
  assert.match(out, /sandbox_mode = "read-only"/);
  assert.match(out, /developer_instructions = """\nActivate/);
});

test("codex profile prepends its description to the shared instructions", () => {
  const out = renderCodexProfile(spec);
  assert.match(out, /The user selected this profile\.\n\nActivate/);
  assert.doesNotMatch(out, /name = /);
});

test("rendering is deterministic", () => {
  assert.equal(renderClaudeCode(spec), renderClaudeCode(spec));
  assert.equal(renderCodex(spec), renderCodex(spec));
});
