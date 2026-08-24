import type { Plan, PlannedAction, Receipt } from "./domain.js";

/**
 * Pure install planner. Decides per target file what a run may do, following
 * the installer contract: never silently overwrite user files, stay
 * idempotent, and only ever remove files the receipt proves we created.
 *
 * `disk` maps a target path to its current content hash, or `undefined` when
 * the file does not exist.
 */
export const planInstall = (
  desired: ReadonlyMap<string, string>,
  disk: ReadonlyMap<string, string | undefined>,
  receipt: Receipt,
): Plan => {
  const actions: Array<PlannedAction> = [];
  for (const [target, desiredHash] of desired) {
    const onDisk = disk.get(target);
    const managedHash = receipt.files[target];
    if (onDisk === undefined) {
      actions.push({ _tag: "Create", target });
    } else if (onDisk === desiredHash) {
      actions.push({ _tag: "Unchanged", target });
    } else if (managedHash !== undefined && onDisk === managedHash) {
      actions.push({ _tag: "Update", target });
    } else {
      actions.push({ _tag: "PreserveUserFile", target });
    }
  }
  return { actions };
};

/**
 * Orphans are files the receipt lists but the desired set no longer contains
 * (an uninstall desires nothing). They are only removed while unmodified.
 */
export const planOrphans = (
  desired: ReadonlyMap<string, string>,
  disk: ReadonlyMap<string, string | undefined>,
  receipt: Receipt,
): ReadonlyArray<PlannedAction> => {
  const actions: Array<PlannedAction> = [];
  for (const [target, managedHash] of Object.entries(receipt.files)) {
    if (desired.has(target)) {
      continue;
    }
    const onDisk = disk.get(target);
    if (onDisk === undefined) {
      continue;
    }
    actions.push(
      onDisk === managedHash
        ? { _tag: "RemoveOrphan", target }
        : { _tag: "PreserveUserFile", target },
    );
  }
  return actions;
};

/**
 * The next receipt claims only files this installer actually owns: everything
 * it created or updated, plus files it already owned before. A file that was
 * already present with identical content (for example installed via the
 * skills.sh CLI) stays unclaimed, so update and uninstall never touch it.
 */
export const nextReceiptFiles = (
  desired: ReadonlyMap<string, string>,
  plan: Plan,
  previous: Receipt,
): Record<string, string> => {
  const files: Record<string, string> = {};
  for (const action of plan.actions) {
    const previousHash = previous.files[action.target];
    if (action._tag === "PreserveUserFile") {
      if (previousHash !== undefined) {
        files[action.target] = previousHash;
      }
      continue;
    }
    if (action._tag === "Unchanged" && previousHash === undefined) {
      continue;
    }
    const hash = desired.get(action.target);
    if (hash !== undefined) {
      files[action.target] = hash;
    }
  }
  return files;
};
