import type {
  ContentSelection,
  DesiredNode,
  Harness,
  OperationPlan,
  PlannedAction,
} from "./domain.js";
import { HARNESSES } from "./domain.js";
import { buildAgentComponent, buildSkillComponent } from "./content.js";
import { diskMatchesNode, inspectNode } from "./filesystem.js";
import type { BuiltMutation, MutationBase, PreparedLifecycle } from "./lifecycle.js";
import { snapshotIdentity } from "./planner.js";

type ReceiptlessRequest = MutationBase & {
  readonly harnesses?: ReadonlyArray<Harness>;
  readonly skills?: ContentSelection;
  readonly agents?: ContentSelection;
};

type ReceiptlessCandidate = {
  readonly componentKey: string;
  readonly alternatives: Array<DesiredNode>;
};

const addCandidate = (
  candidates: Map<string, ReceiptlessCandidate>,
  componentKey: string,
  node: DesiredNode,
): void => {
  const identity = snapshotIdentity(node);
  const current = candidates.get(identity) ?? { componentKey, alternatives: [] };
  current.alternatives.push(node);
  candidates.set(identity, current);
};

const receiptlessNodes = (prepared: PreparedLifecycle): ReadonlyArray<ReceiptlessCandidate> => {
  const candidates = new Map<string, ReceiptlessCandidate>();
  for (const name of prepared.index.skills.keys()) {
    for (const mode of ["symlink", "copy"] as const) {
      const component = buildSkillComponent(prepared.index, name, HARNESSES, mode);
      for (const node of component?.nodes ?? []) {
        addCandidate(candidates, `skill:${name}`, node);
      }
    }
  }
  for (const name of prepared.index.agents.keys()) {
    const component = buildAgentComponent(prepared.index, name, HARNESSES);
    for (const node of component?.nodes ?? []) {
      addCandidate(candidates, `agent:${name}`, node);
    }
  }
  return Array.from(candidates.values());
};

const receiptlessAction = (
  prepared: PreparedLifecycle,
  candidate: ReceiptlessCandidate,
  force: boolean,
): PlannedAction | OperationPlan["conflicts"][number] | undefined => {
  const first = candidate.alternatives[0];
  if (first === undefined) {
    return undefined;
  }
  const snapshot = inspectNode(prepared.roots, first);
  if (snapshot.disk.kind === "missing") {
    return undefined;
  }
  const matching = candidate.alternatives.find((node) =>
    diskMatchesNode(snapshot.disk, node, prepared.roots),
  );
  if (matching !== undefined || force) {
    return {
      kind: "Remove",
      componentKey: candidate.componentKey,
      node: matching ?? first,
      expectedFingerprint: snapshot.fingerprint,
    };
  }
  return {
    componentKey: candidate.componentKey,
    root: first.root,
    relativePath: first.relativePath,
    reason: "Receiptless content does not exactly match this package; use --force to remove it.",
  };
};

const isPlannedAction = (
  value: PlannedAction | OperationPlan["conflicts"][number],
): value is PlannedAction => "node" in value;

const receiptlessUninstallPlan = (prepared: PreparedLifecycle, force: boolean): OperationPlan => {
  const actions: Array<PlannedAction> = [];
  const conflicts: Array<OperationPlan["conflicts"][number]> = [];
  for (const candidate of receiptlessNodes(prepared)) {
    const result = receiptlessAction(prepared, candidate, force);
    if (result === undefined) {
      continue;
    }
    if (isPlannedAction(result)) {
      actions.push(result);
    } else {
      conflicts.push(result);
    }
  }
  return { actions, conflicts };
};

export const buildReceiptlessUninstall = (
  prepared: PreparedLifecycle,
  request: ReceiptlessRequest,
): BuiltMutation => {
  if (
    request.harnesses !== undefined ||
    request.skills !== undefined ||
    request.agents !== undefined
  ) {
    throw new Error("Scoped uninstall requires a valid Receipt v2.");
  }
  const plan = receiptlessUninstallPlan(prepared, request.force);
  return {
    plan,
    nextReceipt: null,
    componentCount: new Set(plan.actions.map((action) => action.componentKey)).size,
  };
};
