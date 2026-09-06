import {
  closeSync,
  fsyncSync,
  lstatSync,
  openSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { randomUUID } from "node:crypto";
import { isRecord } from "./domain.js";

export const isErrno = (error: unknown, code: string): boolean =>
  isRecord(error) && error["code"] === code;

export const lstatIfPresent = (path: string): ReturnType<typeof lstatSync> | undefined => {
  try {
    return lstatSync(path);
  } catch (error) {
    if (isErrno(error, "ENOENT")) {
      return undefined;
    }
    throw error;
  }
};

export const removeEntry = (path: string): void => {
  try {
    const stat = lstatSync(path);
    rmSync(path, { recursive: stat.isDirectory() && !stat.isSymbolicLink(), force: true });
  } catch (error) {
    if (!isErrno(error, "ENOENT")) {
      throw error;
    }
  }
};

export const assertRegularStateFile = (path: string): void => {
  const stat = lstatIfPresent(path);
  if (stat === undefined) {
    return;
  }
  if (stat.isSymbolicLink() || !stat.isFile()) {
    throw new Error(`Installer state path must be a regular file: ${path}`);
  }
};

export const writeNewFile = (path: string, content: string | Uint8Array, mode: number): void => {
  const descriptor = openSync(path, "wx", mode);
  let complete = false;
  try {
    writeFileSync(descriptor, content);
    fsyncSync(descriptor);
    complete = true;
  } finally {
    closeSync(descriptor);
    if (!complete) {
      removeEntry(path);
    }
  }
};

export const atomicWrite = (path: string, content: string): void => {
  assertRegularStateFile(path);
  const temporary = `${path}.${process.pid}.${randomUUID()}.tmp`;
  try {
    writeNewFile(temporary, content, 0o600);
    renameSync(temporary, path);
  } finally {
    removeEntry(temporary);
  }
};
