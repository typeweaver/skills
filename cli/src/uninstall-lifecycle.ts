import { existsSync, readdirSync, rmdirSync } from "node:fs";
import type {
  ComponentReceipt,
  ContentSelection,
  DesiredComponent,
  Harness,
  ReceiptV2,
  RootPaths,
} from "./domain.js";
import type { ActionReport, BuiltMutation, MutationBase, PreparedLifecycle } from "./lifecycle.js";
import {
  buildNextReceipt,
  executeMutation,
  inspectForPlan,
  prepareLifecycle,
} from "./lifecycle.js";
import { desiredComponentFromReceipt, planComponents } from "./planner.js";
import { readReceiptState } from "./receipt.js";
import { buildReceiptlessUninstall } from "./uninstall-receiptless.js";

export type UninstallRequest = MutationBase & {
  readonly harnesses?: ReadonlyArray<Harness>;
  readonly skills?: ContentSelection;
  readonly agents?: ContentSelection;
};

const namesForUninstall = (
  selection: ContentSelection | undefined,
  components: ReadonlyArray<ComponentReceipt>,
  kind: ComponentReceipt["kind"],
): ReadonlySet<string> => {
  const available = components
    .filter((component) => component.kind === kind)
    .map(({ name }) => name);
  if (selection === undefined || selection.kind === "all") {
    return new Set(available);
  }
  if (selection.kind === "none") {
    return new Set();
  }
  const unknown = selection.names.filter((name) => !available.includes(name));
  if (unknown.length > 0) {
    throw new Error(`Unknown installed ${kind}s: ${unknown.toSorted().join(", ")}`);
  }
  return new Set(selection.names);
};

const remainingComponent = (
  component: ComponentReceipt,
  consumers: ReadonlyArray<Harness>,
): DesiredComponent | undefined => {
  const remaining = desiredComponentFromReceipt(component, consumers);
  return remaining.nodes.length === 0 ? undefined : remaining;
};

const scopedUninstall = (
  request: UninstallRequest,
  receipt: ReceiptV2,
): {
  readonly desired: ReadonlyArray<DesiredComponent>;
  readonly retained: ReadonlyArray<ComponentReceipt>;
} => {
  const contentScoped = request.skills !== undefined || request.agents !== undefined;
  const defaultSelection: ContentSelection = { kind: contentScoped ? "none" : "all" };
  const skillNames = namesForUninstall(
    request.skills ?? defaultSelection,
    receipt.components,
    "skill",
  );
  const agentNames = namesForUninstall(
    request.agents ?? defaultSelection,
    receipt.components,
    "agent",
  );
  const desired: Array<DesiredComponent> = [];
  const retained: Array<ComponentReceipt> = [];
  const removedHarnesses = request.harnesses;
  for (const component of receipt.components) {
    const selected =
      component.kind === "skill" ? skillNames.has(component.name) : agentNames.has(component.name);
    if (!selected) {
      retained.push(component);
      continue;
    }
    if (removedHarnesses === undefined) {
      continue;
    }
    const consumers = component.consumers.filter((harness) => !removedHarnesses.includes(harness));
    if (consumers.length === 0) {
      continue;
    }
    const remaining = remainingComponent(component, consumers);
    if (remaining === undefined) {
      continue;
    }
    desired.push(remaining);
  }
  return { desired, retained };
};

const selectedPrevious = (
  receipt: ReceiptV2,
  retained: ReadonlyArray<ComponentReceipt>,
): ReadonlyArray<ComponentReceipt> => {
  const retainedKeys = new Set(retained.map((component) => component.key));
  return receipt.components.filter((component) => !retainedKeys.has(component.key));
};

const buildManagedUninstall = (
  prepared: PreparedLifecycle,
  request: UninstallRequest,
  receipt: ReceiptV2,
  packageVersion: string,
): BuiltMutation => {
  const { desired, retained } = scopedUninstall(request, receipt);
  const remainingCount = retained.length + desired.length;
  const next = remainingCount === 0 ? null : buildNextReceipt(packageVersion, retained, desired);
  const previous = selectedPrevious(receipt, retained);
  const plan = planComponents({
    desired,
    previous,
    snapshots: inspectForPlan(prepared.roots, desired, previous),
    roots: prepared.roots,
    force: request.force,
    allowAdoption: false,
    ...(next === null ? {} : { nextReceipt: next }),
  });
  return { plan, nextReceipt: next, componentCount: previous.length };
};

const buildUninstall = (
  prepared: PreparedLifecycle,
  request: UninstallRequest,
  packageVersion: string,
): BuiltMutation => {
  const state = readReceiptState(prepared.roots);
  return state.kind === "valid"
    ? buildManagedUninstall(prepared, request, state.receipt, packageVersion)
    : buildReceiptlessUninstall(prepared, request);
};

const removeEmptyStateRoot = (roots: RootPaths): void => {
  if (existsSync(roots.state) && readdirSync(roots.state).length === 0) {
    rmdirSync(roots.state);
  }
};

export const uninstallLifecycle = (
  request: UninstallRequest,
  packageVersion: string,
): ActionReport => {
  const prepared = prepareLifecycle(request);
  const report = executeMutation(prepared, request, () =>
    buildUninstall(prepared, request, packageVersion),
  );
  if (!request.dryRun) {
    removeEmptyStateRoot(prepared.roots);
  }
  return report;
};
