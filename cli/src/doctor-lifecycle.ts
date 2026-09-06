import type { ComponentReceipt, Env, ReceiptState } from "./domain.js";
import { diskMatchesNode, inspectNode } from "./filesystem.js";
import type { MutationBase, PreparedLifecycle } from "./lifecycle.js";
import { prepareLifecycle } from "./lifecycle.js";
import { nodesFromReceipt } from "./planner.js";
import { readReceiptState } from "./receipt.js";
import { transactionStatus } from "./transaction.js";

export type DoctorIssue = {
  readonly root?: string;
  readonly relativePath?: string;
  readonly message: string;
};

export type DoctorReport = {
  readonly packageVersion: string;
  readonly receiptState: ReceiptState["kind"];
  readonly installedVersion?: string;
  readonly components: ReadonlyArray<ComponentReceipt>;
  readonly issues: ReadonlyArray<DoctorIssue>;
  readonly transaction: "none" | "applying" | "committed";
};

const invalidEnvironmentReport = (packageVersion: string, error: unknown): DoctorReport => ({
  packageVersion,
  receiptState: "invalid",
  components: [],
  issues: [{ message: error instanceof Error ? error.message : String(error) }],
  transaction: "none",
});

const inspectTransaction = (
  prepared: PreparedLifecycle,
  issues: Array<DoctorIssue>,
): DoctorReport["transaction"] => {
  try {
    const transaction = transactionStatus(prepared.roots);
    if (transaction !== "none") {
      issues.push({
        message: `Interrupted transaction is ${transaction}; rerun a mutating command to recover.`,
      });
    }
    return transaction;
  } catch (error) {
    issues.push({ message: error instanceof Error ? error.message : String(error) });
    return "none";
  }
};

const inspectComponents = (
  prepared: PreparedLifecycle,
  components: ReadonlyArray<ComponentReceipt>,
): ReadonlyArray<DoctorIssue> => {
  const issues: Array<DoctorIssue> = [];
  for (const component of components) {
    for (const node of nodesFromReceipt(component)) {
      const snapshot = inspectNode(prepared.roots, node);
      if (diskMatchesNode(snapshot.disk, node, prepared.roots)) {
        continue;
      }
      issues.push({
        root: node.root,
        relativePath: node.relativePath,
        message:
          snapshot.disk.kind === "missing"
            ? "Managed artifact is missing."
            : "Managed artifact was modified.",
      });
    }
  }
  return issues;
};

const reportWithoutReceipt = (
  packageVersion: string,
  state: Exclude<ReceiptState, { readonly kind: "valid" }>,
  issues: ReadonlyArray<DoctorIssue>,
  transaction: DoctorReport["transaction"],
): DoctorReport => ({
  packageVersion,
  receiptState: state.kind,
  components: [],
  issues: [
    ...issues,
    state.kind === "missing"
      ? { message: "No Receipt v2 is installed." }
      : { message: state.message },
  ],
  transaction,
});

export const doctorLifecycle = (
  packageVersion: string,
  options: { readonly env?: Env; readonly contentDirectory?: string } = {},
): DoctorReport => {
  const request: MutationBase = { force: false, dryRun: true, ...options };
  let prepared: PreparedLifecycle;
  try {
    prepared = prepareLifecycle(request);
  } catch (error) {
    return invalidEnvironmentReport(packageVersion, error);
  }
  const issues: Array<DoctorIssue> = [];
  const transaction = inspectTransaction(prepared, issues);
  const state = readReceiptState(prepared.roots);
  if (state.kind !== "valid") {
    return reportWithoutReceipt(packageVersion, state, issues, transaction);
  }
  return {
    packageVersion,
    receiptState: "valid",
    installedVersion: state.receipt.packageVersion,
    components: state.receipt.components,
    issues: [...issues, ...inspectComponents(prepared, state.receipt.components)],
    transaction,
  };
};
