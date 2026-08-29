#!/usr/bin/env node
// Copies skills and agents into `cli/content` at pack time (`prepack`). The
// published tarball then contains that snapshot, so `npx typeweaver-skills
// install` does not clone GitHub or fetch the repository.
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Console, Effect, FileSystem } from "effect";
import { dirname, join } from "node:path";

const cliDir = dirname(dirname(import.meta.dirname));
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
  yield* fs.copyFile(join(repoDir, "LICENSE"), join(contentDir, "LICENSE"));
  yield* Console.log(`bundled content into ${contentDir}`);
});

NodeRuntime.runMain(bundle.pipe(Effect.provide(NodeServices.layer)));
