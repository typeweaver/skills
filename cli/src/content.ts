import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type {
  AgentComponentReceipt,
  ComponentReceipt,
  ContentSelection,
  DesiredComponent,
  DesiredDirectoryNode,
  DesiredFile,
  DesiredFileNode,
  DesiredNode,
  DesiredSymlinkNode,
  Harness,
  ManagedArtifact,
  SkillComponentReceipt,
  SkillMode,
} from "./domain.js";
import { HARNESSES, componentKey, sha256 } from "./domain.js";
import type { ContentIndex, SkillSource } from "./content-index.js";

export { indexContent } from "./content-index.js";
export type { AgentSource, ContentIndex, SkillSource } from "./content-index.js";

export const contentRoot = (): string => join(dirname(dirname(import.meta.dirname)), "content");

export const resolveSelection = (
  selection: ContentSelection,
  available: Iterable<string>,
  label: string,
): ReadonlyArray<string> => {
  const known = new Set(available);
  if (selection.kind === "all") {
    return Array.from(known).toSorted();
  }
  if (selection.kind === "none") {
    return [];
  }
  const names = Array.from(new Set(selection.names));
  const unknown = names.filter((name) => !known.has(name));
  if (unknown.length > 0) {
    throw new Error(`Unknown ${label}: ${unknown.toSorted().join(", ")}`);
  }
  return names.toSorted();
};

const selectedConsumers = (harnesses: ReadonlyArray<Harness>): ReadonlyArray<Harness> =>
  HARNESSES.filter((harness) => harnesses.includes(harness));

const loadSkillFiles = (source: SkillSource): ReadonlyArray<DesiredFile> =>
  source.files.map((relativePath) => {
    const content = readFileSync(join(source.directory, ...relativePath.split("/")));
    return { relativePath, content, hash: sha256(content) };
  });

const directoryNode = (
  root: DesiredDirectoryNode["root"],
  name: string,
  files: ReadonlyArray<DesiredFile>,
  actualMode: DesiredDirectoryNode["actualMode"],
): DesiredDirectoryNode => ({ kind: "directory", root, relativePath: name, files, actualMode });

const skillProjection = (
  harness: "claude-code" | "kiro",
  name: string,
  files: ReadonlyArray<DesiredFile>,
  mode: SkillMode,
): DesiredDirectoryNode | DesiredSymlinkNode => {
  const root = harness === "claude-code" ? "claude-skills" : "kiro-skills";
  return mode === "copy"
    ? directoryNode(root, name, files, "copy")
    : {
        kind: "symlink",
        root,
        relativePath: name,
        targetRoot: "canonical-skills",
        targetRelativePath: name,
      };
};

export const buildSkillComponent = (
  index: ContentIndex,
  name: string,
  consumers: ReadonlyArray<Harness>,
  mode: SkillMode,
): DesiredComponent | undefined => {
  const source = index.skills.get(name);
  if (source === undefined) {
    return undefined;
  }
  const orderedConsumers = selectedConsumers(consumers);
  const files = loadSkillFiles(source);
  const nodes: Array<DesiredNode> = [directoryNode("canonical-skills", name, files, "canonical")];
  if (orderedConsumers.includes("claude-code")) {
    nodes.push(skillProjection("claude-code", name, files, mode));
  }
  if (orderedConsumers.includes("kiro")) {
    nodes.push(skillProjection("kiro", name, files, mode));
  }
  return {
    key: componentKey("skill", name),
    kind: "skill",
    name,
    consumers: orderedConsumers,
    requestedMode: mode,
    nodes,
  };
};

const ADAPTER_TARGETS: ReadonlyArray<{
  readonly adapter: string;
  readonly harness: Harness;
  readonly root: DesiredFileNode["root"];
  readonly relativePath: (name: string) => string;
}> = [
  {
    adapter: "claude.md",
    harness: "claude-code",
    root: "claude-agents",
    relativePath: (name) => `${name}.md`,
  },
  {
    adapter: "opencode.md",
    harness: "opencode",
    root: "opencode-agents",
    relativePath: (name) => `${name}.md`,
  },
  {
    adapter: "codex.toml",
    harness: "codex",
    root: "codex-agents",
    relativePath: (name) => `${name}.toml`,
  },
  {
    adapter: "codex-profile.toml",
    harness: "codex",
    root: "codex-profiles",
    relativePath: (name) => `${name}.config.toml`,
  },
];

export const buildAgentComponent = (
  index: ContentIndex,
  name: string,
  consumers: ReadonlyArray<Harness>,
): DesiredComponent | undefined => {
  const source = index.agents.get(name);
  if (source === undefined) {
    return undefined;
  }
  const orderedConsumers = selectedConsumers(consumers);
  const nodes = ADAPTER_TARGETS.filter(
    ({ adapter, harness }) => source.adapters.has(adapter) && orderedConsumers.includes(harness),
  ).map(({ adapter, root, relativePath }): DesiredFileNode => {
    const content = readFileSync(join(source.directory, adapter));
    return {
      kind: "file",
      root,
      relativePath: relativePath(name),
      content,
      hash: sha256(content),
      actualMode: "copy",
    };
  });
  if (nodes.length === 0) {
    return undefined;
  }
  return {
    key: componentKey("agent", name),
    kind: "agent",
    name,
    consumers: orderedConsumers.filter((harness) => harness !== "kiro"),
    nodes,
  };
};

const artifactFromNode = (node: DesiredNode): ReadonlyArray<ManagedArtifact> => {
  if (node.kind === "directory") {
    return node.files.map((file) => ({
      kind: "file",
      root: node.root,
      relativePath: `${node.relativePath}/${file.relativePath}`,
      installedHash: file.hash,
      actualMode: node.actualMode,
    }));
  }
  if (node.kind === "file") {
    return [
      {
        kind: "file",
        root: node.root,
        relativePath: node.relativePath,
        installedHash: node.hash,
        actualMode: node.actualMode,
      },
    ];
  }
  return [
    {
      kind: "symlink",
      root: node.root,
      relativePath: node.relativePath,
      targetRoot: node.targetRoot,
      targetRelativePath: node.targetRelativePath,
      actualMode: "symlink",
    },
  ];
};

export const componentToReceipt = (component: DesiredComponent): ComponentReceipt => {
  const base = {
    key: component.key,
    name: component.name,
    consumers: component.consumers,
    artifacts: component.nodes.flatMap(artifactFromNode),
  };
  if (component.kind === "skill") {
    const receipt: SkillComponentReceipt = {
      ...base,
      kind: "skill",
      requestedMode: component.requestedMode ?? "symlink",
    };
    return receipt;
  }
  const receipt: AgentComponentReceipt = { ...base, kind: "agent" };
  return receipt;
};
