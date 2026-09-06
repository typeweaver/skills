import type {
  ComponentReceipt,
  DesiredComponent,
  DesiredDirectoryNode,
  DesiredFile,
  DesiredFileNode,
  DesiredNode,
  DesiredSymlinkNode,
  Harness,
  ManagedArtifact,
} from "./domain.js";

const skillNodesFromReceipt = (component: ComponentReceipt): ReadonlyArray<DesiredNode> => {
  const nodes: Array<DesiredNode> = [];
  const fileGroups = new Map<
    string,
    {
      readonly root: DesiredDirectoryNode["root"];
      readonly relativePath: string;
      readonly files: Array<DesiredFile>;
      readonly actualMode: DesiredDirectoryNode["actualMode"];
    }
  >();
  for (const artifact of component.artifacts) {
    if (artifact.kind === "symlink") {
      const node: DesiredSymlinkNode = {
        kind: "symlink",
        root: artifact.root,
        relativePath: artifact.relativePath,
        targetRoot: artifact.targetRoot,
        targetRelativePath: artifact.targetRelativePath,
      };
      nodes.push(node);
      continue;
    }
    const [boundary, ...rest] = artifact.relativePath.split("/");
    if (boundary === undefined || rest.length === 0) {
      continue;
    }
    const identity = `${artifact.root}:${boundary}`;
    const group = fileGroups.get(identity) ?? {
      root: artifact.root,
      relativePath: boundary,
      files: [],
      actualMode: artifact.actualMode,
    };
    group.files.push({
      relativePath: rest.join("/"),
      content: new Uint8Array(),
      hash: artifact.installedHash,
    });
    fileGroups.set(identity, group);
  }
  for (const group of fileGroups.values()) {
    nodes.push({
      kind: "directory",
      root: group.root,
      relativePath: group.relativePath,
      files: group.files.toSorted((left, right) =>
        left.relativePath.localeCompare(right.relativePath),
      ),
      actualMode: group.actualMode,
    });
  }
  return nodes;
};

const agentNodesFromReceipt = (component: ComponentReceipt): ReadonlyArray<DesiredNode> =>
  component.artifacts.flatMap((artifact): ReadonlyArray<DesiredFileNode> => {
    if (artifact.kind !== "file") {
      return [];
    }
    return [
      {
        kind: "file",
        root: artifact.root,
        relativePath: artifact.relativePath,
        content: new Uint8Array(),
        hash: artifact.installedHash,
        actualMode: "copy",
      },
    ];
  });

export const nodesFromReceipt = (component: ComponentReceipt): ReadonlyArray<DesiredNode> =>
  component.kind === "skill" ? skillNodesFromReceipt(component) : agentNodesFromReceipt(component);

const skillArtifactServes = (
  artifact: ManagedArtifact,
  consumers: ReadonlyArray<Harness>,
): boolean => {
  if (artifact.root === "canonical-skills") {
    return consumers.length > 0;
  }
  if (artifact.root === "claude-skills") {
    return consumers.includes("claude-code");
  }
  return artifact.root === "kiro-skills" && consumers.includes("kiro");
};

const agentArtifactServes = (
  artifact: ManagedArtifact,
  consumers: ReadonlyArray<Harness>,
): boolean => {
  if (artifact.root === "claude-agents") {
    return consumers.includes("claude-code");
  }
  if (artifact.root === "opencode-agents") {
    return consumers.includes("opencode");
  }
  return (
    (artifact.root === "codex-agents" || artifact.root === "codex-profiles") &&
    consumers.includes("codex")
  );
};

export const desiredComponentFromReceipt = (
  component: ComponentReceipt,
  consumers: ReadonlyArray<Harness>,
): DesiredComponent => {
  const filtered: ComponentReceipt = {
    ...component,
    consumers,
    artifacts: component.artifacts.filter((artifact) =>
      component.kind === "skill"
        ? skillArtifactServes(artifact, consumers)
        : agentArtifactServes(artifact, consumers),
    ),
  };
  return {
    key: component.key,
    kind: component.kind,
    name: component.name,
    consumers,
    ...(component.kind === "skill" ? { requestedMode: component.requestedMode } : {}),
    nodes: nodesFromReceipt(filtered),
  };
};
