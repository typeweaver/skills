import { lstatSync, readFileSync } from "node:fs";
import type { ReceiptState, ReceiptV2, RootPaths } from "./domain.js";
import { isRecord } from "./domain.js";
import { parseReceipt } from "./receipt-decode.js";

export { isRootId, isSafeRelativePath, parseReceipt } from "./receipt-decode.js";

export const receiptPath = (roots: RootPaths): string => `${roots.state}/receipt.json`;

/** The lead shared by every error when an agent is installed without skills. */
export const agentsRequireSkills =
  "Agents route to other repository skills at runtime, so install the repository skills too.";

/**
 * A component set that records an agent but no skill cannot satisfy an agent
 * that routes to repository skills. It covers a legacy receipt and a resolved
 * update selection whose skills no longer exist in the package.
 */
export const hasAgentWithoutSkill = (
  components: ReadonlyArray<{ readonly kind: "skill" | "agent" }>,
): boolean =>
  components.some((component) => component.kind === "agent") &&
  !components.some((component) => component.kind === "skill");

const isMissingError = (error: unknown): boolean => isRecord(error) && error["code"] === "ENOENT";

export const readReceiptState = (roots: RootPaths): ReceiptState => {
  try {
    const path = receiptPath(roots);
    const stat = lstatSync(path);
    if (stat.isSymbolicLink() || !stat.isFile()) {
      return { kind: "invalid", message: "Receipt path must be a regular file." };
    }
    return parseReceipt(readFileSync(path, "utf8"));
  } catch (error) {
    if (isMissingError(error)) {
      return { kind: "missing" };
    }
    return { kind: "invalid", message: `Cannot read receipt: ${String(error)}` };
  }
};

export const serializeReceipt = (receipt: ReceiptV2): string =>
  `${JSON.stringify(receipt, null, 2)}\n`;
