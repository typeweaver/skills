import { createHash } from "node:crypto";

export const HARNESSES = ["claude-code", "codex", "opencode", "kiro"] as const;
export type Harness = (typeof HARNESSES)[number];

export const ROOT_IDS = [
  "canonical-skills",
  "claude-skills",
  "kiro-skills",
  "claude-agents",
  "opencode-agents",
  "codex-agents",
  "codex-profiles",
  "state",
] as const;
export type RootId = (typeof ROOT_IDS)[number];

export type Env = {
  readonly home: string;
  readonly codexHome: string;
  readonly configHome: string;
  readonly kiroHome: string;
};

export type RootPaths = Readonly<Record<RootId, string>>;
export type SkillMode = "symlink" | "copy";
export type ActualMode = "canonical" | "symlink" | "copy";

export type ContentSelection =
  | { readonly kind: "all" }
  | { readonly kind: "none" }
  | { readonly kind: "names"; readonly names: ReadonlyArray<string> };

export type FileArtifact = {
  readonly kind: "file";
  readonly root: RootId;
  readonly relativePath: string;
  readonly installedHash: string;
  readonly actualMode: Exclude<ActualMode, "symlink">;
};

export type SymlinkArtifact = {
  readonly kind: "symlink";
  readonly root: RootId;
  readonly relativePath: string;
  readonly targetRoot: RootId;
  readonly targetRelativePath: string;
  readonly actualMode: "symlink";
};

export type ManagedArtifact = FileArtifact | SymlinkArtifact;

type ComponentBase = {
  readonly key: string;
  readonly name: string;
  readonly consumers: ReadonlyArray<Harness>;
  readonly artifacts: ReadonlyArray<ManagedArtifact>;
};

export type SkillComponentReceipt = ComponentBase & {
  readonly kind: "skill";
  readonly requestedMode: SkillMode;
};

export type AgentComponentReceipt = ComponentBase & {
  readonly kind: "agent";
};

export type ComponentReceipt = SkillComponentReceipt | AgentComponentReceipt;

export type ReceiptV2 = {
  readonly schemaVersion: 2;
  readonly packageVersion: string;
  readonly components: ReadonlyArray<ComponentReceipt>;
};

export type ReceiptState =
  | { readonly kind: "missing" }
  | { readonly kind: "valid"; readonly receipt: ReceiptV2 }
  | { readonly kind: "legacy"; readonly message: string }
  | { readonly kind: "invalid"; readonly message: string };

export type DesiredFile = {
  readonly relativePath: string;
  readonly content: Uint8Array;
  readonly hash: string;
};

export type DesiredDirectoryNode = {
  readonly kind: "directory";
  readonly root: RootId;
  readonly relativePath: string;
  readonly files: ReadonlyArray<DesiredFile>;
  readonly actualMode: Exclude<ActualMode, "symlink">;
};

export type DesiredFileNode = {
  readonly kind: "file";
  readonly root: RootId;
  readonly relativePath: string;
  readonly content: Uint8Array;
  readonly hash: string;
  readonly actualMode: "copy";
};

export type DesiredSymlinkNode = {
  readonly kind: "symlink";
  readonly root: RootId;
  readonly relativePath: string;
  readonly targetRoot: RootId;
  readonly targetRelativePath: string;
};

export type DesiredNode = DesiredDirectoryNode | DesiredFileNode | DesiredSymlinkNode;

export type DesiredComponent = {
  readonly key: string;
  readonly kind: "skill" | "agent";
  readonly name: string;
  readonly consumers: ReadonlyArray<Harness>;
  readonly requestedMode?: SkillMode;
  readonly nodes: ReadonlyArray<DesiredNode>;
};

export type DiskEntry =
  | { readonly kind: "missing" }
  | { readonly kind: "file"; readonly hash: string }
  | { readonly kind: "directory"; readonly entries: ReadonlyArray<TreeEntry> }
  | { readonly kind: "symlink"; readonly target: string }
  | { readonly kind: "other"; readonly description: string };

export type TreeEntry = {
  readonly relativePath: string;
  readonly kind: "directory" | "file" | "symlink" | "other";
  readonly hash?: string;
  readonly target?: string;
};

export type NodeSnapshot = {
  readonly node: DesiredNode;
  readonly disk: DiskEntry;
  readonly fingerprint: string;
};

export type PlannedAction = {
  readonly kind: "Create" | "Adopt" | "Keep" | "Replace" | "Remove";
  readonly componentKey: string;
  readonly node: DesiredNode;
  readonly expectedFingerprint: string;
};

export type Conflict = {
  readonly componentKey: string;
  readonly root: RootId;
  readonly relativePath: string;
  readonly reason: string;
};

export type OperationPlan = {
  readonly actions: ReadonlyArray<PlannedAction>;
  readonly conflicts: ReadonlyArray<Conflict>;
  readonly nextReceipt?: ReceiptV2;
};

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const sha256 = (content: Uint8Array | string): string =>
  createHash("sha256").update(content).digest("hex");

export const componentKey = (kind: "skill" | "agent", name: string): string => `${kind}:${name}`;
