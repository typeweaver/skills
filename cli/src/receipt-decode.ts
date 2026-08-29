import type {
  AgentComponentReceipt,
  ComponentReceipt,
  Harness,
  ManagedArtifact,
  ReceiptState,
  ReceiptV2,
  SkillComponentReceipt,
} from "./domain.js";
import { componentKey, isRecord } from "./domain.js";
import {
  agentArtifactMatchesConsumers,
  parseArtifacts,
  skillArtifactMatchesConsumers,
  validAgentArtifact,
  validSkillArtifact,
} from "./receipt-artifacts.js";
import { NAME_PATTERN, parseConsumers } from "./receipt-ids.js";

export { isRootId, isSafeRelativePath } from "./receipt-ids.js";

type ParsedComponentBase = {
  readonly source: Record<string, unknown>;
  readonly kind: "skill" | "agent";
  readonly name: string;
  readonly consumers: ReadonlyArray<Harness>;
  readonly artifacts: ReadonlyArray<ManagedArtifact>;
};

const parseComponentBase = (value: unknown): ParsedComponentBase | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }
  const kind = value["kind"];
  const name = value["name"];
  const consumers = parseConsumers(value["consumers"]);
  const artifacts = parseArtifacts(value["artifacts"]);
  if (
    (kind !== "skill" && kind !== "agent") ||
    typeof name !== "string" ||
    !NAME_PATTERN.test(name) ||
    value["key"] !== componentKey(kind, name) ||
    consumers === undefined ||
    artifacts === undefined ||
    artifacts.length === 0
  ) {
    return undefined;
  }
  return { source: value, kind, name, consumers, artifacts };
};

const parseSkillComponent = (base: ParsedComponentBase): SkillComponentReceipt | undefined => {
  const requestedMode = base.source["requestedMode"];
  const hasCanonical = base.artifacts.some(
    (artifact) => artifact.kind === "file" && artifact.root === "canonical-skills",
  );
  if (
    (requestedMode !== "symlink" && requestedMode !== "copy") ||
    !base.artifacts.every((artifact) => validSkillArtifact(artifact, base.name)) ||
    !base.artifacts.every((artifact) =>
      skillArtifactMatchesConsumers(artifact, base.consumers, requestedMode),
    ) ||
    !hasCanonical
  ) {
    return undefined;
  }
  return {
    key: componentKey("skill", base.name),
    kind: "skill",
    name: base.name,
    consumers: base.consumers,
    artifacts: base.artifacts,
    requestedMode,
  };
};

const parseAgentComponent = (base: ParsedComponentBase): AgentComponentReceipt | undefined => {
  if (
    !base.artifacts.every((artifact) => validAgentArtifact(artifact, base.name)) ||
    !base.artifacts.every((artifact) => agentArtifactMatchesConsumers(artifact, base.consumers))
  ) {
    return undefined;
  }
  return {
    key: componentKey("agent", base.name),
    kind: "agent",
    name: base.name,
    consumers: base.consumers,
    artifacts: base.artifacts,
  };
};

const parseComponent = (value: unknown): ComponentReceipt | undefined => {
  const base = parseComponentBase(value);
  if (base === undefined) {
    return undefined;
  }
  return base.kind === "skill" ? parseSkillComponent(base) : parseAgentComponent(base);
};

const parseReceiptValue = (value: unknown): ReceiptState => {
  if (isRecord(value) && value["schemaVersion"] === undefined && value["files"] !== undefined) {
    return { kind: "legacy", message: "Legacy schema-less receipt found." };
  }
  if (!isRecord(value) || value["schemaVersion"] !== 2) {
    return { kind: "invalid", message: "Receipt schemaVersion must be 2." };
  }
  const packageVersion = value["packageVersion"];
  const componentsValue = value["components"];
  if (
    typeof packageVersion !== "string" ||
    packageVersion.length === 0 ||
    !Array.isArray(componentsValue)
  ) {
    return { kind: "invalid", message: "Receipt packageVersion or components are invalid." };
  }
  const components: Array<ComponentReceipt> = [];
  const keys = new Set<string>();
  for (const candidate of componentsValue) {
    const component = parseComponent(candidate);
    if (component === undefined || keys.has(component.key)) {
      return { kind: "invalid", message: "Receipt contains an invalid or duplicate component." };
    }
    keys.add(component.key);
    components.push(component);
  }
  const receipt: ReceiptV2 = { schemaVersion: 2, packageVersion, components };
  return { kind: "valid", receipt };
};

export const parseReceipt = (raw: string): ReceiptState => {
  try {
    const value: unknown = JSON.parse(raw);
    return parseReceiptValue(value);
  } catch {
    return { kind: "invalid", message: "Receipt is not valid JSON." };
  }
};
