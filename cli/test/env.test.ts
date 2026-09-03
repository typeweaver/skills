import { assert, it } from "@effect/vitest";
import type { Env } from "../src/domain.js";
import { rootPaths } from "../src/env.js";

it("maps every harness and installer state to its allowlisted user root", () => {
  const env: Env = {
    home: "/users/example",
    configHome: "/users/example/config",
    codexHome: "/users/example/codex",
    kiroHome: "/users/example/kiro",
  };
  assert.deepEqual(rootPaths(env), {
    "canonical-skills": "/users/example/.agents/skills",
    "claude-skills": "/users/example/.claude/skills",
    "kiro-skills": "/users/example/kiro/skills",
    "claude-agents": "/users/example/.claude/agents",
    "opencode-agents": "/users/example/config/opencode/agents",
    "codex-agents": "/users/example/codex/agents",
    "codex-profiles": "/users/example/codex",
    state: "/users/example/config/skill-it",
  });
});
