import { readFileSync, readdirSync, renameSync, rmdirSync, unlinkSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import type { DesiredNode, OperationPlan, PlannedAction, ReceiptV2, RootPaths } from "./domain.js";
import {
  ensureNodeParent,
  ensureRootDirectory,
  fingerprintDisk,
  inspectNode,
  resolveInRoot,
} from "./filesystem.js";
import {
  cleanupJournal,
  recoverTransaction,
  rollbackApplyingJournal,
  writeJournal,
  type Journal,
  type JournalEntry,
} from "./journal.js";
import { writeNode } from "./node-writer.js";
import { receiptPath, serializeReceipt } from "./receipt.js";
import {
  assertRegularStateFile,
  atomicWrite,
  isErrno,
  lstatIfPresent,
  removeEntry,
  writeNewFile,
} from "./state-io.js";

export type TransactionOptions = {
  readonly nextReceipt: ReceiptV2 | null;
  readonly failAfterActions?: number;
  readonly failAfterBackupRename?: boolean;
  readonly failAfterReceiptCommit?: boolean;
};

const lockPath = (roots: RootPaths): string => join(roots.state, "install.lock");

const processIsAlive = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return isErrno(error, "EPERM");
  }
};

const acquireLock = (roots: RootPaths): string => {
  ensureRootDirectory(roots, "state");
  const path = lockPath(roots);
  const token = `${process.pid}:${randomUUID()}`;
  try {
    writeNewFile(path, `${token}\n`, 0o600);
    return token;
  } catch (error) {
    if (!isErrno(error, "EEXIST")) {
      throw error;
    }
  }
  assertRegularStateFile(path);
  const current = readFileSync(path, "utf8").trim();
  const pid = Math.trunc(Number(current.split(":", 1)[0] ?? ""));
  const owner =
    Number.isSafeInteger(pid) && pid > 0 && processIsAlive(pid)
      ? `PID ${pid}`
      : "a leftover lock file";
  throw new Error(
    `Another typeweaver-skills command holds ${path} (${owner}). If nothing is running, delete that file and retry.`,
  );
};

const releaseLock = (roots: RootPaths, token: string): void => {
  const path = lockPath(roots);
  if (lstatIfPresent(path) === undefined) {
    return;
  }
  assertRegularStateFile(path);
  if (readFileSync(path, "utf8").trim() === token) {
    unlinkSync(path);
  }
  if (readdirSync(roots.state).length === 0) {
    rmdirSync(roots.state);
  }
};

const siblingRelativePath = (node: DesiredNode, id: string, index: number, kind: string): string =>
  join(
    dirname(node.relativePath),
    `.typeweaver-skills-${id}-${index}-${kind}-${basename(node.relativePath)}`,
  )
    .split("\\")
    .join("/");

const assertUnchanged = (roots: RootPaths, action: PlannedAction): void => {
  const current = inspectNode(roots, action.node);
  if (current.fingerprint !== action.expectedFingerprint) {
    throw new Error(
      `Filesystem changed after preflight: ${action.node.root}:${action.node.relativePath}`,
    );
  }
  if (fingerprintDisk(current.disk) !== action.expectedFingerprint) {
    throw new Error(`Filesystem fingerprint mismatch: ${action.node.relativePath}`);
  }
};

const mutateAction = (
  roots: RootPaths,
  action: PlannedAction,
  run: {
    readonly journal: Journal;
    readonly index: number;
    readonly options: TransactionOptions;
  },
): Journal => {
  const { journal, index, options } = run;
  assertUnchanged(roots, action);
  ensureNodeParent(roots, action.node);
  const target = resolveInRoot(roots, action.node.root, action.node.relativePath);
  const backupRelative = siblingRelativePath(action.node, journal.id, index, "backup");
  const temporaryRelative = siblingRelativePath(action.node, journal.id, index, "new");
  const hadOriginal = action.kind !== "Create";
  const entry: JournalEntry = {
    root: action.node.root,
    relativePath: action.node.relativePath,
    backupRelativePath: backupRelative,
    hadOriginal,
    ...(action.kind === "Remove" ? {} : { temporaryRelativePath: temporaryRelative }),
  };
  const next = { ...journal, entries: [...journal.entries, entry] };
  writeJournal(roots, next);
  if (hadOriginal) {
    renameSync(target, resolveInRoot(roots, action.node.root, backupRelative));
    if (options.failAfterBackupRename === true) {
      throw new Error("Injected transaction failure after backup rename.");
    }
  }
  if (action.kind !== "Remove") {
    const temporary = resolveInRoot(roots, action.node.root, temporaryRelative);
    writeNode(roots, action.node, temporary);
    renameSync(temporary, target);
  }
  return next;
};

const previousReceipt = (roots: RootPaths): string | null => {
  const path = receiptPath(roots);
  if (lstatIfPresent(path) === undefined) {
    return null;
  }
  assertRegularStateFile(path);
  return readFileSync(path, "utf8");
};

const commitReceipt = (roots: RootPaths, receipt: ReceiptV2 | null): void => {
  const path = receiptPath(roots);
  if (receipt === null) {
    removeEntry(path);
  } else {
    atomicWrite(path, serializeReceipt(receipt));
  }
};

export const executeTransactionLocked = (
  roots: RootPaths,
  plan: OperationPlan,
  options: TransactionOptions,
): void => {
  try {
    let journal: Journal = {
      schemaVersion: 1,
      id: randomUUID(),
      phase: "applying",
      previousReceipt: previousReceipt(roots),
      entries: [],
    };
    writeJournal(roots, journal);
    const mutations = plan.actions.filter(
      (action) => action.kind === "Create" || action.kind === "Replace" || action.kind === "Remove",
    );
    for (const [index, action] of mutations.entries()) {
      journal = mutateAction(roots, action, { journal, index, options });
      if (options.failAfterActions === index + 1) {
        throw new Error(`Injected transaction failure after ${index + 1} actions.`);
      }
    }
    commitReceipt(roots, options.nextReceipt);
    if (options.failAfterReceiptCommit === true) {
      throw new Error("Injected transaction failure after receipt commit.");
    }
    writeJournal(roots, { ...journal, phase: "committed" });
    cleanupJournal(roots, { ...journal, phase: "committed" });
  } catch (error) {
    rollbackApplyingJournal(roots);
    throw error;
  }
};

export const withInstallationLock = <A>(
  roots: RootPaths,
  run: (recovery: "none" | "rolled-back" | "cleaned") => A,
): A => {
  const token = acquireLock(roots);
  try {
    return run(recoverTransaction(roots));
  } finally {
    releaseLock(roots, token);
  }
};

export { recoverTransaction, transactionStatus } from "./journal.js";
