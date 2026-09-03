import type {
  ComponentReceipt,
  ContentSelection,
  DesiredComponent,
  Env,
  Harness,
  NodeSnapshot,
  OperationPlan,
  PlannedAction,
  ReceiptV2,
  RootPaths,
  SkillMode,
} from "./domain.js";
import { componentToReceipt, contentRoot, indexContent } from "./content.js";
import { envFromProcess, rootPaths } from "./env.js";
import { ConflictError } from "./errors.js";
import { inspectNode, validateEnvironment } from "./filesystem.js";
import { nodesFromReceipt, snapshotIdentity } from "./planner.js";
import {
  executeTransactionLocked,
  transactionStatus,
  withInstallationLock,
} from "./transaction.js";

export type MutationBase = {
  readonly force: boolean;
  readonly dryRun: boolean;
  readonly env?: Env;
  readonly contentDirectory?: string;
  readonly failAfterActions?: number;
  readonly failAfterBackupRename?: boolean;
  readonly failAfterReceiptCommit?: boolean;
};

export type InstallRequest = MutationBase & {
  readonly harnesses: ReadonlyArray<Harness>;
  readonly skills: ContentSelection;
  readonly agents: ContentSelection;
  readonly mode: SkillMode;
};

export type UpdateRequest = MutationBase;

export type ActionReport = {
  readonly dryRun: boolean;
  readonly recovery: "none" | "rolled-back" | "cleaned";
  readonly actions: ReadonlyArray<PlannedAction>;
  readonly componentCount: number;
};

export type PreparedLifecycle = {
  readonly env: Env;
  readonly roots: RootPaths;
  readonly index: ReturnType<typeof indexContent>;
};

export type BuiltMutation = {
  readonly plan: OperationPlan;
  readonly nextReceipt: ReceiptV2 | null;
  readonly componentCount: number;
};

export const prepareLifecycle = (request: MutationBase): PreparedLifecycle => {
  const env = request.env ?? envFromProcess();
  const roots = rootPaths(env);
  validateEnvironment(env, roots);
  return {
    env,
    roots,
    index: indexContent(request.contentDirectory ?? contentRoot()),
  };
};

export const inspectForPlan = (
  roots: RootPaths,
  desired: ReadonlyArray<DesiredComponent>,
  previous: ReadonlyArray<ComponentReceipt>,
): ReadonlyMap<string, NodeSnapshot> => {
  const nodes = [
    ...previous.flatMap((component) => nodesFromReceipt(component)),
    ...desired.flatMap((component) => component.nodes),
  ];
  const snapshots = new Map<string, NodeSnapshot>();
  for (const node of nodes) {
    snapshots.set(snapshotIdentity(node), inspectNode(roots, node));
  }
  return snapshots;
};

const throwConflicts = (plan: OperationPlan): void => {
  if (plan.conflicts.length === 0) {
    return;
  }
  const conflicts = plan.conflicts.map(
    (conflict) =>
      `${conflict.componentKey} at ${conflict.root}:${conflict.relativePath}: ${conflict.reason}`,
  );
  throw new ConflictError({
    message: [
      `Preflight found ${conflicts.length} conflict(s); no files were changed.`,
      ...conflicts,
    ].join("\n"),
    conflicts,
  });
};

const dryRunMutation = (prepared: PreparedLifecycle, build: () => BuiltMutation): ActionReport => {
  const pending = transactionStatus(prepared.roots);
  if (pending !== "none") {
    throw new Error(`An interrupted ${pending} transaction requires recovery before dry-run.`);
  }
  const built = build();
  throwConflicts(built.plan);
  return {
    dryRun: true,
    recovery: "none",
    actions: built.plan.actions,
    componentCount: built.componentCount,
  };
};

export const executeMutation = (
  prepared: PreparedLifecycle,
  request: MutationBase,
  build: () => BuiltMutation,
): ActionReport => {
  if (request.dryRun) {
    return dryRunMutation(prepared, build);
  }
  return withInstallationLock(prepared.roots, (recovery) => {
    const built = build();
    throwConflicts(built.plan);
    executeTransactionLocked(prepared.roots, built.plan, {
      nextReceipt: built.nextReceipt,
      ...(request.failAfterActions === undefined
        ? {}
        : { failAfterActions: request.failAfterActions }),
      ...(request.failAfterBackupRename === undefined
        ? {}
        : { failAfterBackupRename: request.failAfterBackupRename }),
      ...(request.failAfterReceiptCommit === undefined
        ? {}
        : { failAfterReceiptCommit: request.failAfterReceiptCommit }),
    });
    return {
      dryRun: false,
      recovery,
      actions: built.plan.actions,
      componentCount: built.componentCount,
    };
  });
};

export const buildNextReceipt = (
  packageVersion: string,
  retained: ReadonlyArray<ComponentReceipt>,
  desired: ReadonlyArray<DesiredComponent>,
): ReceiptV2 => ({
  schemaVersion: 2,
  packageVersion,
  components: [...retained, ...desired.map((component) => componentToReceipt(component))].toSorted(
    (left, right) => left.key.localeCompare(right.key),
  ),
});
