import { basename, join } from "node:path";
import { readFileSync, renameSync } from "node:fs";
import type { RootId, RootPaths } from "./domain.js";
import { isRecord } from "./domain.js";
import { resolveInRoot } from "./filesystem.js";
import { isRootId, isSafeRelativePath, receiptPath } from "./receipt.js";
import { assertRegularStateFile, atomicWrite, lstatIfPresent, removeEntry } from "./state-io.js";

export type JournalEntry = {
  readonly root: RootId;
  readonly relativePath: string;
  readonly backupRelativePath: string;
  readonly temporaryRelativePath?: string;
  readonly hadOriginal: boolean;
};

export type Journal = {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly phase: "applying" | "committed";
  readonly previousReceipt: string | null;
  readonly entries: ReadonlyArray<JournalEntry>;
};

export const journalPath = (roots: RootPaths): string => join(roots.state, "transaction.json");

export const writeJournal = (roots: RootPaths, journal: Journal): void => {
  atomicWrite(journalPath(roots), `${JSON.stringify(journal, null, 2)}\n`);
};

const parseJournalEntry = (value: unknown, id: string): JournalEntry | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }
  const root = value["root"];
  const relativePath = value["relativePath"];
  const backupRelativePath = value["backupRelativePath"];
  const temporaryRelativePath = value["temporaryRelativePath"];
  if (
    !isRootId(root) ||
    !isSafeRelativePath(relativePath) ||
    !isSafeRelativePath(backupRelativePath) ||
    typeof value["hadOriginal"] !== "boolean" ||
    (temporaryRelativePath !== undefined && !isSafeRelativePath(temporaryRelativePath)) ||
    !basename(backupRelativePath).startsWith(`.typeweaver-skills-${id}-`)
  ) {
    return undefined;
  }
  return {
    root,
    relativePath,
    backupRelativePath,
    hadOriginal: value["hadOriginal"],
    ...(temporaryRelativePath === undefined ? {} : { temporaryRelativePath }),
  };
};

export const readJournal = (roots: RootPaths): Journal | undefined => {
  const path = journalPath(roots);
  if (lstatIfPresent(path) === undefined) {
    return undefined;
  }
  assertRegularStateFile(path);
  const value: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (
    !isRecord(value) ||
    value["schemaVersion"] !== 1 ||
    typeof value["id"] !== "string" ||
    (value["phase"] !== "applying" && value["phase"] !== "committed") ||
    (typeof value["previousReceipt"] !== "string" && value["previousReceipt"] !== null) ||
    !Array.isArray(value["entries"])
  ) {
    throw new Error("Transaction journal is invalid; refusing automatic recovery.");
  }
  const id = value["id"];
  const entries = value["entries"].map((entry) => parseJournalEntry(entry, id));
  if (entries.some((entry) => entry === undefined)) {
    throw new Error("Transaction journal contains an unsafe recovery path.");
  }
  return {
    schemaVersion: 1,
    id: value["id"],
    phase: value["phase"],
    previousReceipt: value["previousReceipt"],
    entries: entries.filter((entry): entry is JournalEntry => entry !== undefined),
  };
};

const restoreReceipt = (roots: RootPaths, previous: string | null): void => {
  const path = receiptPath(roots);
  if (previous === null) {
    removeEntry(path);
  } else {
    atomicWrite(path, previous);
  }
};

const rollbackEntry = (roots: RootPaths, entry: JournalEntry): void => {
  const target = resolveInRoot(roots, entry.root, entry.relativePath);
  const backup = resolveInRoot(roots, entry.root, entry.backupRelativePath);
  if (entry.temporaryRelativePath !== undefined) {
    removeEntry(resolveInRoot(roots, entry.root, entry.temporaryRelativePath));
  }
  if (lstatIfPresent(backup) !== undefined) {
    removeEntry(target);
    renameSync(backup, target);
  } else if (!entry.hadOriginal) {
    removeEntry(target);
  }
};

const cleanupEntry = (roots: RootPaths, entry: JournalEntry): void => {
  removeEntry(resolveInRoot(roots, entry.root, entry.backupRelativePath));
  if (entry.temporaryRelativePath !== undefined) {
    removeEntry(resolveInRoot(roots, entry.root, entry.temporaryRelativePath));
  }
};

export const rollbackJournal = (roots: RootPaths, journal: Journal): void => {
  for (const entry of journal.entries.toReversed()) {
    rollbackEntry(roots, entry);
  }
  restoreReceipt(roots, journal.previousReceipt);
  removeEntry(journalPath(roots));
};

export const cleanupJournal = (roots: RootPaths, journal: Journal): void => {
  for (const entry of journal.entries) {
    cleanupEntry(roots, entry);
  }
  removeEntry(journalPath(roots));
};

export const recoverTransaction = (roots: RootPaths): "none" | "rolled-back" | "cleaned" => {
  const journal = readJournal(roots);
  if (journal === undefined) {
    return "none";
  }
  if (journal.phase === "committed") {
    cleanupJournal(roots, journal);
    return "cleaned";
  }
  rollbackJournal(roots, journal);
  return "rolled-back";
};

export const rollbackApplyingJournal = (roots: RootPaths): void => {
  const journal = readJournal(roots);
  if (journal?.phase === "applying") {
    rollbackJournal(roots, journal);
  }
};

export const transactionStatus = (roots: RootPaths): "none" | "applying" | "committed" =>
  readJournal(roots)?.phase ?? "none";
