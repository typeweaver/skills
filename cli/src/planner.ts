import type {
  ComponentReceipt,
  DesiredComponent,
  DesiredNode,
  NodeSnapshot,
  OperationPlan,
  PlannedAction,
  ReceiptV2,
  RootPaths,
} from "./domain.js";
import { diskMatchesNode } from "./filesystem.js";
import { nodesFromReceipt } from "./receipt-nodes.js";

export { desiredComponentFromReceipt, nodesFromReceipt } from "./receipt-nodes.js";

const nodeIdentity = (node: DesiredNode): string => `${node.root}:${node.relativePath}`;

const action = (
  kind: PlannedAction["kind"],
  componentKey: string,
  snapshot: NodeSnapshot,
): PlannedAction => ({
  kind,
  componentKey,
  node: snapshot.node,
  expectedFingerprint: snapshot.fingerprint,
});

export type PlanComponentsOptions = {
  readonly desired: ReadonlyArray<DesiredComponent>;
  readonly previous: ReadonlyArray<ComponentReceipt>;
  readonly snapshots: ReadonlyMap<string, NodeSnapshot>;
  readonly roots: RootPaths;
  readonly force: boolean;
  readonly allowAdoption: boolean;
  readonly nextReceipt?: ReceiptV2;
};

const snapshotFor = (
  snapshots: ReadonlyMap<string, NodeSnapshot>,
  node: DesiredNode,
): NodeSnapshot => {
  const snapshot = snapshots.get(nodeIdentity(node));
  if (snapshot === undefined) {
    throw new Error(`Missing filesystem snapshot for ${nodeIdentity(node)}`);
  }
  return { ...snapshot, node };
};

const modeChanged = (previous: ComponentReceipt | undefined, desired: DesiredComponent): boolean =>
  previous?.kind === "skill" &&
  desired.kind === "skill" &&
  previous.requestedMode !== desired.requestedMode;

const planDesiredNode = (
  component: DesiredComponent,
  previous: ComponentReceipt | undefined,
  previousNodes: ReadonlyMap<string, DesiredNode>,
  options: PlanComponentsOptions,
): PlannedAction | { readonly reason: string; readonly snapshot: NodeSnapshot } => {
  const node = component.nodes[0];
  if (node === undefined) {
    throw new Error(`Component has no desired nodes: ${component.key}`);
  }
  const snapshot = snapshotFor(options.snapshots, node);
  if (snapshot.disk.kind === "missing") {
    return action("Create", component.key, snapshot);
  }
  if (diskMatchesNode(snapshot.disk, node, options.roots)) {
    if (previous !== undefined) {
      return action("Keep", component.key, snapshot);
    }
    return options.allowAdoption
      ? action("Adopt", component.key, snapshot)
      : { reason: "Existing matching content is not owned by this installation.", snapshot };
  }
  const oldNode = previousNodes.get(nodeIdentity(node));
  if (
    oldNode !== undefined &&
    diskMatchesNode(snapshot.disk, oldNode, options.roots) &&
    (!modeChanged(previous, component) || options.force)
  ) {
    return action("Replace", component.key, snapshot);
  }
  return options.force
    ? action("Replace", component.key, snapshot)
    : {
        reason: modeChanged(previous, component)
          ? "Changing an installed skill between symlink and copy mode requires --force."
          : "Existing content is foreign or has been modified; rerun with --force to replace this component.",
        snapshot,
      };
};

const withSingleNode = (component: DesiredComponent, node: DesiredNode): DesiredComponent => ({
  ...component,
  nodes: [node],
});

type PlanAccumulator = {
  readonly actions: Array<PlannedAction>;
  readonly conflicts: Array<OperationPlan["conflicts"][number]>;
};

const planDesiredComponents = (
  options: PlanComponentsOptions,
  accumulator: PlanAccumulator,
): void => {
  const previousByKey = new Map(options.previous.map((component) => [component.key, component]));
  for (const component of options.desired) {
    const previous = previousByKey.get(component.key);
    const previousNodes = new Map(
      (previous === undefined ? [] : nodesFromReceipt(previous)).map((node) => [
        nodeIdentity(node),
        node,
      ]),
    );
    for (const node of component.nodes) {
      const result = planDesiredNode(
        withSingleNode(component, node),
        previous,
        previousNodes,
        options,
      );
      if ("reason" in result) {
        accumulator.conflicts.push({
          componentKey: component.key,
          root: node.root,
          relativePath: node.relativePath,
          reason: result.reason,
        });
      } else {
        accumulator.actions.push(result);
      }
    }
  }
};

const planObsoleteComponents = (
  options: PlanComponentsOptions,
  accumulator: PlanAccumulator,
): void => {
  const desiredByKey = new Map(options.desired.map((component) => [component.key, component]));
  for (const previous of options.previous) {
    const desiredNodes = new Set(
      (desiredByKey.get(previous.key)?.nodes ?? []).map((node) => nodeIdentity(node)),
    );
    for (const node of nodesFromReceipt(previous)) {
      if (desiredNodes.has(nodeIdentity(node))) {
        continue;
      }
      const snapshot = snapshotFor(options.snapshots, node);
      if (snapshot.disk.kind === "missing") {
        continue;
      }
      if (diskMatchesNode(snapshot.disk, node, options.roots) || options.force) {
        accumulator.actions.push(action("Remove", previous.key, snapshot));
      } else {
        accumulator.conflicts.push({
          componentKey: previous.key,
          root: node.root,
          relativePath: node.relativePath,
          reason: "Obsolete managed content was modified; rerun with --force to remove it.",
        });
      }
    }
  }
};

const sortKey = (item: { readonly node: DesiredNode }): string =>
  `${item.node.root}:${item.node.relativePath}`;

export const planComponents = (options: PlanComponentsOptions): OperationPlan => {
  const accumulator: PlanAccumulator = { actions: [], conflicts: [] };
  planDesiredComponents(options, accumulator);
  planObsoleteComponents(options, accumulator);
  return {
    actions: accumulator.actions.toSorted((left, right) =>
      sortKey(left).localeCompare(sortKey(right)),
    ),
    conflicts: accumulator.conflicts.toSorted((left, right) =>
      `${left.root}:${left.relativePath}`.localeCompare(`${right.root}:${right.relativePath}`),
    ),
    ...(options.nextReceipt === undefined ? {} : { nextReceipt: options.nextReceipt }),
  };
};

export const snapshotIdentity = nodeIdentity;
