import type { Harness, ManagedArtifact, RootId } from "./domain.js";
import { isRecord } from "./domain.js";
import { HASH_PATTERN, isRootId, isSafeRelativePath } from "./receipt-ids.js";

const parseFileArtifact = (value: Record<string, unknown>): ManagedArtifact | undefined => {
  const root = value["root"];
  const relativePath = value["relativePath"];
  const installedHash = value["installedHash"];
  const actualMode = value["actualMode"];
  if (
    !isRootId(root) ||
    !isSafeRelativePath(relativePath) ||
    typeof installedHash !== "string" ||
    !HASH_PATTERN.test(installedHash) ||
    (actualMode !== "canonical" && actualMode !== "copy")
  ) {
    return undefined;
  }
  return { kind: "file", root, relativePath, installedHash, actualMode };
};

const parseSymlinkArtifact = (value: Record<string, unknown>): ManagedArtifact | undefined => {
  const root = value["root"];
  const relativePath = value["relativePath"];
  const targetRoot = value["targetRoot"];
  const targetRelativePath = value["targetRelativePath"];
  if (
    !isRootId(root) ||
    !isSafeRelativePath(relativePath) ||
    !isRootId(targetRoot) ||
    !isSafeRelativePath(targetRelativePath) ||
    value["actualMode"] !== "symlink"
  ) {
    return undefined;
  }
  return {
    kind: "symlink",
    root,
    relativePath,
    targetRoot,
    targetRelativePath,
    actualMode: "symlink",
  };
};

export const parseArtifacts = (value: unknown): ReadonlyArray<ManagedArtifact> | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const artifacts: Array<ManagedArtifact> = [];
  const identities = new Set<string>();
  for (const candidate of value) {
    if (!isRecord(candidate)) {
      return undefined;
    }
    let artifact: ManagedArtifact | undefined;
    if (candidate["kind"] === "file") {
      artifact = parseFileArtifact(candidate);
    } else if (candidate["kind"] === "symlink") {
      artifact = parseSymlinkArtifact(candidate);
    }
    if (artifact === undefined) {
      return undefined;
    }
    const identity = `${artifact.root}:${artifact.relativePath}`;
    if (identities.has(identity)) {
      return undefined;
    }
    identities.add(identity);
    artifacts.push(artifact);
  }
  return artifacts;
};

export const validSkillArtifact = (artifact: ManagedArtifact, name: string): boolean => {
  if (artifact.kind === "symlink") {
    return (
      (artifact.root === "claude-skills" || artifact.root === "kiro-skills") &&
      artifact.relativePath === name &&
      artifact.targetRoot === "canonical-skills" &&
      artifact.targetRelativePath === name
    );
  }
  if (!artifact.relativePath.startsWith(`${name}/`)) {
    return false;
  }
  if (artifact.root === "canonical-skills") {
    return artifact.actualMode === "canonical";
  }
  return (
    (artifact.root === "claude-skills" || artifact.root === "kiro-skills") &&
    artifact.actualMode === "copy"
  );
};

export const validAgentArtifact = (artifact: ManagedArtifact, name: string): boolean => {
  if (artifact.kind !== "file" || artifact.actualMode !== "copy") {
    return false;
  }
  const expected: Partial<Record<RootId, string>> = {
    "claude-agents": `${name}.md`,
    "opencode-agents": `${name}.md`,
    "codex-agents": `${name}.toml`,
    "codex-profiles": `${name}.config.toml`,
  };
  return expected[artifact.root] === artifact.relativePath;
};

export const skillArtifactMatchesConsumers = (
  artifact: ManagedArtifact,
  consumers: ReadonlyArray<Harness>,
  requestedMode: "symlink" | "copy",
): boolean => {
  if (artifact.root === "canonical-skills") {
    return artifact.kind === "file" && artifact.actualMode === "canonical";
  }
  const consumer = artifact.root === "claude-skills" ? "claude-code" : "kiro";
  return (
    consumers.includes(consumer) &&
    ((requestedMode === "copy" && artifact.kind === "file") ||
      (requestedMode === "symlink" && artifact.kind === "symlink"))
  );
};

export const agentArtifactMatchesConsumers = (
  artifact: ManagedArtifact,
  consumers: ReadonlyArray<Harness>,
): boolean => {
  const consumerByRoot: Partial<Record<RootId, Harness>> = {
    "claude-agents": "claude-code",
    "opencode-agents": "opencode",
    "codex-agents": "codex",
    "codex-profiles": "codex",
  };
  const consumer = consumerByRoot[artifact.root];
  return consumer !== undefined && consumers.includes(consumer);
};
