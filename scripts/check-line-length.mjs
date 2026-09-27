#!/usr/bin/env node
import { dirname } from "node:path";
import { checkRepository } from "./line-length.mjs";

const report = checkRepository(dirname(import.meta.dirname));
for (const message of report.errors) {
  console.error(`error: ${message}`);
}
if (report.errors.length > 0) {
  process.exit(1);
}
console.log(`ok: checked line length in ${report.files} Markdown files`);
