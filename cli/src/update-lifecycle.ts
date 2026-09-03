import type { DesiredComponent, ReceiptV2, RootPaths } from "./domain.js";
import { buildAgentComponent, buildSkillComponent } from "./content.js";
import type { ActionReport, BuiltMutation, PreparedLifecycle, UpdateRequest } from "./lifecycle.js";
import {
  buildNextReceipt,
  executeMutation,
  inspectForPlan,
  prepareLifecycle,
} from "./lifecycle.js";
import { planComponents } from "./planner.js";
import { readReceiptState } from "./receipt.js";

const desiredForUpdate = (
  prepared: PreparedLifecycle,
  receipt: ReceiptV2,
): ReadonlyArray<DesiredComponent> =>
  receipt.components.flatMap((component): ReadonlyArray<DesiredComponent> => {
    const desired =
      component.kind === "skill"
        ? buildSkillComponent(
            prepared.index,
            component.name,
            component.consumers,
            component.requestedMode,
          )
        : buildAgentComponent(prepared.index, component.name, component.consumers);
    return desired === undefined ? [] : [desired];
  });

const requireManagedReceipt = (roots: RootPaths): ReceiptV2 => {
  const state = readReceiptState(roots);
  if (state.kind === "valid" && state.receipt.components.length > 0) {
    return state.receipt;
  }
  const detail = state.kind === "missing" ? "missing" : state.kind;
  throw new Error(`A valid, non-empty Receipt v2 is required for update (${detail}).`);
};

const buildUpdate = (
  prepared: PreparedLifecycle,
  request: UpdateRequest,
  packageVersion: string,
): BuiltMutation => {
  const receipt = requireManagedReceipt(prepared.roots);
  const desired = desiredForUpdate(prepared, receipt);
  const next = buildNextReceipt(packageVersion, [], desired);
  return {
    plan: planComponents({
      desired,
      previous: receipt.components,
      snapshots: inspectForPlan(prepared.roots, desired, receipt.components),
      roots: prepared.roots,
      force: request.force,
      allowAdoption: false,
      nextReceipt: next,
    }),
    nextReceipt: next,
    componentCount: desired.length,
  };
};

/** Refreshes exactly the components recorded in Receipt v2. */
export const updateLifecycle = (request: UpdateRequest, packageVersion: string): ActionReport => {
  const prepared = prepareLifecycle(request);
  return executeMutation(prepared, request, () => buildUpdate(prepared, request, packageVersion));
};
