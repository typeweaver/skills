import { lstatSync, readFileSync } from "node:fs";
import type { ReceiptState, ReceiptV2, RootPaths } from "./domain.js";
import { isRecord } from "./domain.js";
import { parseReceipt } from "./receipt-decode.js";

export { isRootId, isSafeRelativePath, parseReceipt } from "./receipt-decode.js";

export const receiptPath = (roots: RootPaths): string => `${roots.state}/receipt.json`;

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
