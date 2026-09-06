import { closeSync, fsyncSync, mkdirSync, openSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { DesiredNode, RootPaths } from "./domain.js";
import { isRecord } from "./domain.js";
import { resolveInRoot } from "./filesystem.js";

const isErrno = (error: unknown, code: string): boolean =>
  isRecord(error) && error["code"] === code;

const writeNewFile = (path: string, content: Uint8Array): void => {
  const descriptor = openSync(path, "wx", 0o644);
  try {
    writeFileSync(descriptor, content);
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
};

export const writeNode = (roots: RootPaths, node: DesiredNode, target: string): void => {
  if (node.kind === "file") {
    writeNewFile(target, node.content);
    return;
  }
  if (node.kind === "symlink") {
    const linkTarget = resolveInRoot(roots, node.targetRoot, node.targetRelativePath);
    try {
      symlinkSync(linkTarget, target, "dir");
    } catch (error) {
      if (
        ["EACCES", "EINVAL", "ENOTSUP", "EOPNOTSUPP", "EPERM"].some((code) => isErrno(error, code))
      ) {
        throw new Error(
          `Directory symlinks are unavailable for ${node.root}:${node.relativePath}; rerun install with --copy.`,
          { cause: error },
        );
      }
      throw error;
    }
    return;
  }
  mkdirSync(target);
  for (const file of node.files) {
    const filePath = join(target, ...file.relativePath.split("/"));
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, file.content, { mode: 0o644, flush: true });
  }
};
