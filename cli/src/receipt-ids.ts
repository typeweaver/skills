import { posix } from "node:path";
import type { Harness, RootId } from "./domain.js";
import { HARNESSES, ROOT_IDS } from "./domain.js";

export const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
export const HASH_PATTERN = /^[a-f0-9]{64}$/u;

export const isHarness = (value: unknown): value is Harness =>
  typeof value === "string" && (HARNESSES as ReadonlyArray<string>).includes(value);

export const isRootId = (value: unknown): value is RootId =>
  typeof value === "string" && (ROOT_IDS as ReadonlyArray<string>).includes(value);

export const isSafeRelativePath = (value: unknown): value is string => {
  if (typeof value !== "string" || value.length === 0 || value.includes("\0")) {
    return false;
  }
  if (value.includes("\\") || posix.isAbsolute(value) || posix.normalize(value) !== value) {
    return false;
  }
  return value.split("/").every((part) => part !== "" && part !== "." && part !== "..");
};

export const parseConsumers = (value: unknown): ReadonlyArray<Harness> | undefined => {
  if (!Array.isArray(value) || !value.every((entry) => isHarness(entry))) {
    return undefined;
  }
  return new Set(value).size === value.length ? value : undefined;
};
