import YAML from "yaml";

/**
 * A skill whose canonical instructions must be present in the agent's context
 * at session start. `instructions` is the canonical `SKILL.md` body with its
 * YAML frontmatter removed.
 */
export type PreloadedSkill = {
  readonly name: string;
  readonly instructions: string;
};

/**
 * One agent, defined once in `agents/<name>/agent.yaml` plus
 * `instructions.md`. The shared instruction body is identical across
 * harnesses; everything harness-specific is adapter frontmatter data.
 */
export type AgentSpec = {
  readonly name: string;
  readonly description: string;
  readonly instructions: string;
  readonly preload: ReadonlyArray<PreloadedSkill>;
  readonly adapters: {
    readonly "claude-code"?: AdapterSpec;
    readonly opencode?: AdapterSpec;
    readonly codex?: AdapterSpec;
    readonly "codex-profile"?: AdapterSpec;
  };
};

export type AdapterSpec = {
  readonly description?: string;
  readonly frontmatter?: Record<string, unknown>;
};

const MARKER = "# Managed by typeweaver/skills; do not edit — generated from";

const yamlBlock = (data: Record<string, unknown>): string =>
  YAML.stringify(data, { lineWidth: 80, indent: 2 }).trimEnd();

/**
 * Serializes a value as a valid TOML basic string. `JSON.stringify` already
 * escapes `"`, `\`, newlines, and the C0 control characters the TOML spec
 * requires; DEL is the one control character it leaves raw, so escape it too.
 */
const tomlString = (value: string): string => JSON.stringify(value).replaceAll("\u007F", "\\u007F");

const markdownAdapter = (frontmatter: Record<string, unknown>, instructions: string): string =>
  `---\n${yamlBlock(frontmatter)}\n---\n\n${instructions.trim()}\n`;

const preloadedSkillSection = ({ name, instructions }: PreloadedSkill): string =>
  [
    `<!-- BEGIN preloaded skill: ${name} -->`,
    "",
    "This skill is already loaded. Follow it; do not activate it again.",
    "",
    instructions.trim(),
    "",
    `<!-- END preloaded skill: ${name} -->`,
  ].join("\n");

/**
 * The shared instructions followed by the canonical body of every preloaded
 * skill, each delimited so the agent can tell its own instructions from the
 * injected skill content.
 */
const instructionsWithPreloadedSkills = (spec: AgentSpec): string => {
  const sections = [spec.instructions.trim()];
  if (spec.preload.length > 0) {
    sections.push(spec.preload.map(preloadedSkillSection).join("\n\n"));
  }
  return sections.join("\n\n");
};

export const renderClaudeCode = (spec: AgentSpec): string => {
  const adapter = spec.adapters["claude-code"] ?? {};
  return markdownAdapter(
    {
      name: spec.name,
      description: adapter.description ?? spec.description,
      ...adapter.frontmatter,
    },
    instructionsWithPreloadedSkills(spec),
  );
};

export const renderOpencode = (spec: AgentSpec): string => {
  const adapter = spec.adapters.opencode ?? {};
  return markdownAdapter(
    { description: adapter.description ?? spec.description, ...adapter.frontmatter },
    instructionsWithPreloadedSkills(spec),
  );
};

export const renderCodex = (spec: AgentSpec): string => {
  const adapter = spec.adapters.codex ?? {};
  const lines = [
    `${MARKER} agents/${spec.name}/agent.yaml; regenerate with \`npx equip-it generate\`.`,
    `name = ${tomlString(spec.name)}`,
    `description = ${tomlString(adapter.description ?? spec.description)}`,
  ];
  for (const [key, value] of Object.entries(adapter.frontmatter ?? {})) {
    lines.push(`${key} = ${tomlString(String(value))}`);
  }
  lines.push(`developer_instructions = ${tomlString(instructionsWithPreloadedSkills(spec))}`);
  return `${lines.join("\n")}\n`;
};

export const renderCodexProfile = (spec: AgentSpec): string => {
  const adapter = spec.adapters["codex-profile"] ?? {};
  const body = instructionsWithPreloadedSkills(spec);
  const instructions =
    adapter.description !== undefined ? `${adapter.description.trim()}\n\n${body}` : body;
  const lines = [
    `${MARKER} agents/${spec.name}/agent.yaml; regenerate with \`npx equip-it generate\`.`,
  ];
  for (const [key, value] of Object.entries(adapter.frontmatter ?? {})) {
    lines.push(`${key} = ${tomlString(String(value))}`);
  }
  lines.push(`developer_instructions = ${tomlString(instructions)}`);
  return `${lines.join("\n")}\n`;
};

export const ADAPTER_FILES: ReadonlyArray<{
  readonly key: keyof AgentSpec["adapters"];
  readonly file: string;
  readonly render: (spec: AgentSpec) => string;
}> = [
  { key: "claude-code", file: "claude.md", render: renderClaudeCode },
  { key: "opencode", file: "opencode.md", render: renderOpencode },
  { key: "codex", file: "codex.toml", render: renderCodex },
  { key: "codex-profile", file: "codex-profile.toml", render: renderCodexProfile },
];
