#!/usr/bin/env node
import { resolve } from "node:path";

import { checkRepository } from "./relative-links.mjs";

const { checked, errors } = checkRepository(resolve(import.meta.dirname, ".."));

if (errors.length > 0) {
  for (const error of errors) {
    const detail = error.reason === "outside" ? "outside repository" : "missing";
    console.error(`error: ${error.file}: ${detail} ${error.target}`);
  }
  process.exit(1);
}

console.log(`ok: ${checked} relative links resolve`);
