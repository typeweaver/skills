import type { ComponentReceipt, DesiredComponent, ReceiptV2 } from "./domain.js";
import { HARNESSES } from "./domain.js";
import { buildAgentComponent, buildSkillComponent, resolveSelection } from "./content.js";
import type {
  ActionReport,
  BuiltMutation,
  InstallRequest,
  PreparedLifecycle,
} from "./lifecycle.js";
import {
  buildNextReceipt,
  executeMutation,
  inspectForPlan,
  prepareLifecycle,
} from "./lifecycle.js";
import { planComponents } from "./planner.js";
import { readReceiptState } from "./receipt.js";

const uniqueHarnesses = (harnesses: InstallRequest["harnesses"]) =>
  HARNESSES.filter((harness) => harnesses.includes(harness));

const unionHarnesses = (
  left: ComponentReceipt["consumers"],
  right: InstallRequest["harnesses"],
): ComponentReceipt["consumers"] => uniqueHarnesses([...left, ...right]);

type SelectionBuild = {
  readonly prepared: PreparedLifecycle;
  readonly request: InstallRequest;
  readonly previous: ReadonlyMap<string, ComponentReceipt>;
  readonly components: Array<DesiredComponent>;
};

const addSelectedSkills = (build: SelectionBuild, names: ReadonlyArray<string>): void => {
  for (const name of names) {
    const old = build.previous.get(`skill:${name}`);
    const component = buildSkillComponent(
      build.prepared.index,
      name,
      unionHarnesses(old?.consumers ?? [], build.request.harnesses),
      build.request.mode,
    );
    if (component !== undefined) {
      build.components.push(component);
    }
  }
};

const addSelectedAgents = (build: SelectionBuild, names: ReadonlyArray<string>): void => {
  for (const name of names) {
    const old = build.previous.get(`agent:${name}`);
    const component = buildAgentComponent(
      build.prepared.index,
      name,
      unionHarnesses(old?.consumers ?? [], build.request.harnesses),
    );
    if (component !== undefined) {
      build.components.push(component);
    }
  }
};

const selectedInstallComponents = (
  prepared: PreparedLifecycle,
  request: InstallRequest,
  receipt: ReceiptV2 | undefined,
): ReadonlyArray<DesiredComponent> => {
  const skillNames = resolveSelection(request.skills, prepared.index.skills.keys(), "skills");
  const agentNames = resolveSelection(request.agents, prepared.index.agents.keys(), "agents");
  if (skillNames.length === 0 && agentNames.length === 0) {
    throw new Error("The install selection is empty; choose at least one skill or agent.");
  }
  const previous = new Map(
    (receipt?.components ?? []).map((component) => [component.key, component]),
  );
  const components: Array<DesiredComponent> = [];
  const build = { prepared, request, previous, components };
  addSelectedSkills(build, skillNames);
  addSelectedAgents(build, agentNames);
  if (components.length === 0) {
    throw new Error("None of the selected harnesses supports the requested content.");
  }
  return components;
};

const buildInstall = (
  prepared: PreparedLifecycle,
  request: InstallRequest,
  packageVersion: string,
): BuiltMutation => {
  const state = readReceiptState(prepared.roots);
  const receipt = state.kind === "valid" ? state.receipt : undefined;
  const desired = selectedInstallComponents(prepared, request, receipt);
  const selectedKeys = new Set(desired.map((component) => component.key));
  const previous = (receipt?.components ?? []).filter((component) =>
    selectedKeys.has(component.key),
  );
  const retained = (receipt?.components ?? []).filter(
    (component) => !selectedKeys.has(component.key),
  );
  const next = buildNextReceipt(packageVersion, retained, desired);
  return {
    plan: planComponents({
      desired,
      previous,
      snapshots: inspectForPlan(prepared.roots, desired, previous),
      roots: prepared.roots,
      force: request.force,
      allowAdoption: true,
      nextReceipt: next,
    }),
    nextReceipt: next,
    componentCount: desired.length,
  };
};

/** Adds selected skills and agents without removing omitted installed components. */
export const installLifecycle = (request: InstallRequest, packageVersion: string): ActionReport => {
  const prepared = prepareLifecycle(request);
  return executeMutation(prepared, request, () => buildInstall(prepared, request, packageVersion));
};
