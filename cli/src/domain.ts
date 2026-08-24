import { createHash } from "node:crypto";

export const HARNESSES = ["claude-code", "codex", "opencode", "kiro"] as const;
export type Harness = (typeof HARNESSES)[number];

/**
 * Filesystem roots resolved once at startup; keeps every planner pure.
 * `configHome` follows the XDG Base Directory convention: the per-user
 * configuration root, `$XDG_CONFIG_HOME` when set and `~/.config` otherwise.
 * OpenCode and our receipt live under it.
 */
export type Env = {
  readonly home: string;
  readonly codexHome: string;
  readonly configHome: string;
};

/** One file the installer wants to exist, with its rendered content. */
export type DesiredFile = {
  readonly target: string;
  readonly content: Uint8Array;
  readonly hash: string;
};

/** What the installer remembers about files it manages. */
export type Receipt = {
  readonly packageVersion: string;
  readonly harnesses: ReadonlyArray<Harness>;
  readonly files: Readonly<Record<string, string>>;
};

export const emptyReceipt: Receipt = {
  packageVersion: "none",
  harnesses: [],
  files: {},
};

export type PlannedAction =
  | { readonly _tag: "Create"; readonly target: string }
  | { readonly _tag: "Update"; readonly target: string }
  | { readonly _tag: "Unchanged"; readonly target: string }
  | { readonly _tag: "PreserveUserFile"; readonly target: string }
  | { readonly _tag: "RemoveOrphan"; readonly target: string };

export type Plan = {
  readonly actions: ReadonlyArray<PlannedAction>;
};

/** Narrowing guard for parsed JSON/YAML values. */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const sha256 = (content: Uint8Array): string =>
  createHash("sha256").update(content).digest("hex");
