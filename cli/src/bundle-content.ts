#!/usr/bin/env node
// Copies the repository's skills and agents into the package so the published
// artifact is self-contained and installs work offline. Runs via `prepack`.
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Console, Effect, FileSystem } from "effect";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const cliDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const repoDir = dirname(cliDir);
const contentDir = join(cliDir, "content");

const bundle = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  if (yield* fs.exists(contentDir)) {
    yield* fs.remove(contentDir, { recursive: true });
  }
  yield* fs.makeDirectory(contentDir, { recursive: true });
  yield* fs.copy(join(repoDir, "skills"), join(contentDir, "skills"));
  yield* fs.copy(join(repoDir, "agents"), join(contentDir, "agents"));
  yield* Console.log(`bundled content into ${contentDir}`);
});

NodeRuntime.runMain(bundle.pipe(Effect.provide(NodeServices.layer)));
