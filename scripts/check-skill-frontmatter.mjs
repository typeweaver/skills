#!/usr/bin/env node
import { dirname } from "node:path";
import { validateRepository } from "./skill-frontmatter.mjs";

const report = validateRepository(dirname(import.meta.dirname));
for (const message of report.errors) {
  console.error(`error: ${message}`);
}
if (report.errors.length > 0) {
  process.exit(1);
}
console.log(`ok: parsed ${report.skills} SKILL.md and ${report.metadata} openai.yaml files`);
