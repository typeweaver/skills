import YAML from "yaml";

/**
 * One agent, defined once in `agents/<name>/agent.yaml` plus
 * `instructions.md`. The shared instruction body is identical across
 * harnesses; everything harness-specific is adapter frontmatter data.
 */
export interface AgentSpec {
  readonly name: string;
  readonly description: string;
  readonly instructions: string;
  readonly adapters: {
    readonly "claude-code"?: AdapterSpec;
    readonly opencode?: AdapterSpec;
    readonly codex?: AdapterSpec;
    readonly "codex-profile"?: AdapterSpec;
  };
}

export interface AdapterSpec {
  readonly description?: string;
  readonly frontmatter?: Record<string, unknown>;
}

const MARKER = "# Managed by typeweaver/skills; do not edit — generated from";

const yamlBlock = (data: Record<string, unknown>): string =>
  YAML.stringify(data, { lineWidth: 80, indent: 2 }).trimEnd();

/** Quotes and escapes a value so it is a valid TOML string literal. */
const escapeTomlValue = (value: string): string =>
  `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

const markdownAdapter = (frontmatter: Record<string, unknown>, instructions: string): string =>
  `---\n${yamlBlock(frontmatter)}\n---\n\n${instructions.trim()}\n`;

export const renderClaudeCode = (spec: AgentSpec): string => {
  const adapter = spec.adapters["claude-code"] ?? {};
  return markdownAdapter(
    {
      name: spec.name,
      description: adapter.description ?? spec.description,
      ...adapter.frontmatter,
    },
    spec.instructions,
  );
};

export const renderOpencode = (spec: AgentSpec): string => {
  const adapter = spec.adapters.opencode ?? {};
  return markdownAdapter(
    { description: adapter.description ?? spec.description, ...adapter.frontmatter },
    spec.instructions,
  );
};

export const renderCodex = (spec: AgentSpec): string => {
  const adapter = spec.adapters.codex ?? {};
  const lines = [
    `${MARKER} agents/${spec.name}/agent.yaml; regenerate with \`npx typeweaver-skills generate\`.`,
    `name = ${escapeTomlValue(spec.name)}`,
    `description = ${escapeTomlValue(adapter.description ?? spec.description)}`,
  ];
  for (const [key, value] of Object.entries(adapter.frontmatter ?? {})) {
    lines.push(`${key} = ${escapeTomlValue(String(value))}`);
  }
  lines.push(`developer_instructions = """`, spec.instructions.trim(), `"""`);
  return `${lines.join("\n")}\n`;
};

export const renderCodexProfile = (spec: AgentSpec): string => {
  const adapter = spec.adapters["codex-profile"] ?? {};
  const instructions =
    adapter.description !== undefined
      ? `${adapter.description.trim()}\n\n${spec.instructions.trim()}`
      : spec.instructions.trim();
  const lines = [
    `${MARKER} agents/${spec.name}/agent.yaml; regenerate with \`npx typeweaver-skills generate\`.`,
  ];
  for (const [key, value] of Object.entries(adapter.frontmatter ?? {})) {
    lines.push(`${key} = ${escapeTomlValue(String(value))}`);
  }
  lines.push(`developer_instructions = """`, instructions, `"""`);
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
