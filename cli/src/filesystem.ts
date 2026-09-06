import { lstatSync, mkdirSync, readFileSync, readlinkSync, readdirSync } from "node:fs";
import { dirname, isAbsolute, join, parse, relative, resolve, sep } from "node:path";
import type {
  DesiredDirectoryNode,
  DesiredNode,
  DiskEntry,
  Env,
  NodeSnapshot,
  RootId,
  RootPaths,
  TreeEntry,
} from "./domain.js";
import { ROOT_IDS, isRecord, sha256 } from "./domain.js";
import { isSafeRelativePath } from "./receipt.js";

const lstatIfPresent = (path: string): ReturnType<typeof lstatSync> | undefined => {
  try {
    return lstatSync(path);
  } catch (error) {
    if (isRecord(error) && error["code"] === "ENOENT") {
      return undefined;
    }
    throw error;
  }
};

const assertAbsoluteNonRoot = (path: string, label: string): void => {
  if (!isAbsolute(path) || resolve(path) === parse(resolve(path)).root) {
    throw new Error(`${label} must be an absolute, non-root path: ${path || "<empty>"}`);
  }
};

const statDirectoryWithoutLink = (path: string, label: string): void => {
  const stat = lstatIfPresent(path);
  if (stat === undefined) {
    throw new Error(`${label} does not exist: ${path}`);
  }
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    throw new Error(`${label} must be a real directory, not a symlink or file: ${path}`);
  }
};

const pathInside = (anchor: string, target: string): boolean => {
  const rel = relative(anchor, target);
  return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel));
};

const validateDescendants = (anchor: string, target: string, label: string): void => {
  if (!pathInside(anchor, target)) {
    throw new Error(`${label} escapes its validated anchor: ${target}`);
  }
  let current = anchor;
  const rel = relative(anchor, target);
  for (const segment of rel === "" ? [] : rel.split(sep)) {
    current = join(current, segment);
    if (lstatIfPresent(current) === undefined) {
      continue;
    }
    statDirectoryWithoutLink(current, label);
  }
};

const validateOptionalAnchor = (anchor: string, home: string, label: string): void => {
  assertAbsoluteNonRoot(anchor, label);
  if (pathInside(home, anchor)) {
    validateDescendants(home, anchor, label);
    return;
  }
  if (lstatIfPresent(anchor) === undefined) {
    throw new Error(`${label} outside HOME must already exist so it can be validated: ${anchor}`);
  }
  statDirectoryWithoutLink(anchor, label);
};

/** Validates every authority-bearing root before receipt data is inspected. */
export const validateEnvironment = (env: Env, roots: RootPaths): void => {
  assertAbsoluteNonRoot(env.home, "HOME");
  if (lstatIfPresent(env.home) === undefined) {
    throw new Error(`HOME does not exist: ${env.home}`);
  }
  statDirectoryWithoutLink(env.home, "HOME");
  validateOptionalAnchor(env.configHome, env.home, "XDG_CONFIG_HOME");
  validateOptionalAnchor(env.codexHome, env.home, "CODEX_HOME");
  validateOptionalAnchor(env.kiroHome, env.home, "KIRO_HOME");

  const anchors: Readonly<Record<RootId, string>> = {
    "canonical-skills": env.home,
    "claude-skills": env.home,
    "kiro-skills": env.kiroHome,
    "claude-agents": env.home,
    "opencode-agents": env.configHome,
    "codex-agents": env.codexHome,
    "codex-profiles": env.codexHome,
    state: env.configHome,
  };
  for (const root of ROOT_IDS) {
    assertAbsoluteNonRoot(roots[root], `root ${root}`);
    validateDescendants(anchors[root], roots[root], `root ${root}`);
  }
};

export const resolveInRoot = (roots: RootPaths, root: RootId, relativePath: string): string => {
  if (!isSafeRelativePath(relativePath)) {
    throw new Error(`Unsafe relative path for ${root}: ${String(relativePath)}`);
  }
  const target = resolve(roots[root], ...relativePath.split("/"));
  if (!pathInside(roots[root], target) || target === roots[root]) {
    throw new Error(`Path escapes root ${root}: ${relativePath}`);
  }
  return target;
};

const ensureDirectory = (directory: string): void => {
  if (lstatIfPresent(directory) !== undefined) {
    statDirectoryWithoutLink(directory, "directory");
    return;
  }
  ensureDirectory(dirname(directory));
  mkdirSync(directory);
  statDirectoryWithoutLink(directory, "directory");
};

export const ensureRootDirectory = (roots: RootPaths, root: RootId): void => {
  ensureDirectory(roots[root]);
};

export const ensureNodeParent = (roots: RootPaths, node: DesiredNode): void => {
  ensureRootDirectory(roots, node.root);
  ensureDirectory(dirname(resolveInRoot(roots, node.root, node.relativePath)));
};

const validateNodeAncestors = (roots: RootPaths, node: DesiredNode): "present" | "missing" => {
  const root = roots[node.root];
  if (lstatIfPresent(root) === undefined) {
    return "missing";
  }
  statDirectoryWithoutLink(root, `root ${node.root}`);
  const target = resolveInRoot(roots, node.root, node.relativePath);
  let current = root;
  for (const segment of relative(root, dirname(target)).split(sep).filter(Boolean)) {
    current = join(current, segment);
    if (lstatIfPresent(current) === undefined) {
      return "missing";
    }
    statDirectoryWithoutLink(current, `ancestor of ${node.relativePath}`);
  }
  return "present";
};

const treeEntry = (directory: string, path: string): TreeEntry => {
  const stat = lstatSync(path);
  const relativePath = relative(directory, path).split(sep).join("/");
  if (stat.isSymbolicLink()) {
    return { relativePath, kind: "symlink", target: readlinkSync(path) };
  }
  if (stat.isDirectory()) {
    return { relativePath, kind: "directory" };
  }
  if (stat.isFile()) {
    return { relativePath, kind: "file", hash: sha256(readFileSync(path)) };
  }
  return { relativePath, kind: "other" };
};

const readTree = (directory: string): ReadonlyArray<TreeEntry> => {
  const entries: Array<TreeEntry> = [];
  const visit = (current: string): void => {
    for (const name of readdirSync(current).toSorted()) {
      const path = join(current, name);
      const entry = treeEntry(directory, path);
      entries.push(entry);
      if (entry.kind === "directory") {
        visit(path);
      }
    }
  };
  visit(directory);
  return entries.toSorted((left, right) => left.relativePath.localeCompare(right.relativePath));
};

const readDiskEntry = (target: string): DiskEntry => {
  const stat = lstatIfPresent(target);
  if (stat === undefined) {
    return { kind: "missing" };
  }
  if (stat.isSymbolicLink()) {
    return { kind: "symlink", target: readlinkSync(target) };
  }
  if (stat.isDirectory()) {
    return { kind: "directory", entries: readTree(target) };
  }
  if (stat.isFile()) {
    return { kind: "file", hash: sha256(readFileSync(target)) };
  }
  return { kind: "other", description: "unsupported filesystem entry" };
};

export const fingerprintDisk = (disk: DiskEntry): string => sha256(JSON.stringify(disk));

export const inspectNode = (roots: RootPaths, node: DesiredNode): NodeSnapshot => {
  const ancestors = validateNodeAncestors(roots, node);
  const disk =
    ancestors === "missing"
      ? ({ kind: "missing" } as const)
      : readDiskEntry(resolveInRoot(roots, node.root, node.relativePath));
  return { node, disk, fingerprint: fingerprintDisk(disk) };
};

const expectedTree = (node: DesiredDirectoryNode): ReadonlyArray<TreeEntry> => {
  const directories = new Set<string>();
  for (const file of node.files) {
    const parts = file.relativePath.split("/");
    for (let index = 1; index < parts.length; index += 1) {
      directories.add(parts.slice(0, index).join("/"));
    }
  }
  return [
    ...Array.from(directories).map((relativePath): TreeEntry => ({
      relativePath,
      kind: "directory",
    })),
    ...node.files.map((file): TreeEntry => ({
      relativePath: file.relativePath,
      kind: "file",
      hash: file.hash,
    })),
  ].toSorted((left, right) => left.relativePath.localeCompare(right.relativePath));
};

export const diskMatchesNode = (disk: DiskEntry, node: DesiredNode, roots: RootPaths): boolean => {
  if (node.kind === "file") {
    return disk.kind === "file" && disk.hash === node.hash;
  }
  if (node.kind === "directory") {
    return (
      disk.kind === "directory" &&
      JSON.stringify(disk.entries) === JSON.stringify(expectedTree(node))
    );
  }
  if (disk.kind !== "symlink") {
    return false;
  }
  const target = resolve(dirname(resolveInRoot(roots, node.root, node.relativePath)), disk.target);
  return target === resolveInRoot(roots, node.targetRoot, node.targetRelativePath);
};
