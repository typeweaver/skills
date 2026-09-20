import type { PlatformError } from "effect";
import { Console, Effect, FileSystem } from "effect";
import { join } from "node:path";
import type { AgentSpec } from "../agent-adapters.js";
import { ADAPTER_FILES } from "../agent-adapters.js";
import type { SkillSources } from "../agent-source.js";
import { parseAgentSource } from "../agent-source.js";
import { indexSkills } from "../content-index.js";
import { AgentSourceError, GeneratorDriftError } from "../errors.js";

const readSkillSources = (
  repoDir: string,
): Effect.Effect<
  SkillSources,
  AgentSourceError | PlatformError.PlatformError,
  FileSystem.FileSystem
> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const skills = yield* Effect.try({
      try: () => indexSkills(join(repoDir, "skills")),
      catch: (error) =>
        new AgentSourceError({
          message: error instanceof Error ? error.message : String(error),
        }),
    });
    const sources = new Map<string, string>();
    for (const [name, source] of skills) {
      sources.set(name, yield* fs.readFileString(join(source.directory, "SKILL.md")));
    }
    return sources;
  });

const loadAgentSpec = (
  agentDir: string,
  name: string,
  skills: SkillSources,
): Effect.Effect<
  AgentSpec,
  AgentSourceError | PlatformError.PlatformError,
  FileSystem.FileSystem
> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const source = yield* fs.readFileString(join(agentDir, "agent.yaml"));
    const instructions = yield* fs.readFileString(join(agentDir, "instructions.md"));
    return yield* parseAgentSource(source, name, instructions, skills);
  });

type RenderedAdapter = {
  readonly target: string;
  readonly content: string;
  readonly label: string;
};

const renderAgent = (agentDir: string, spec: AgentSpec): ReadonlyArray<RenderedAdapter> =>
  ADAPTER_FILES.filter((adapter) => spec.adapters[adapter.key] !== undefined).map((adapter) => ({
    target: join(agentDir, adapter.file),
    content: adapter.render(spec),
    label: `agents/${spec.name}/${adapter.file}`,
  }));

const isAgentSourceDirectory = (
  fs: FileSystem.FileSystem,
  agentDir: string,
): Effect.Effect<boolean, PlatformError.PlatformError> =>
  Effect.gen(function* () {
    if ((yield* fs.stat(agentDir)).type !== "Directory") {
      return false;
    }
    return yield* fs.exists(join(agentDir, "agent.yaml"));
  });

const syncAdapter = (
  fs: FileSystem.FileSystem,
  rendered: RenderedAdapter,
  check: boolean,
  drifted: Array<string>,
): Effect.Effect<boolean, PlatformError.PlatformError> =>
  Effect.gen(function* () {
    const current = (yield* fs.exists(rendered.target))
      ? yield* fs.readFileString(rendered.target)
      : undefined;
    const isCurrent = current === rendered.content;
    if (isCurrent) {
      return false;
    }
    if (check) {
      drifted.push(rendered.label);
      return false;
    }
    yield* fs.writeFileString(rendered.target, rendered.content);
    yield* Console.log(`generated ${rendered.label}`);
    return true;
  });

/** Regenerates every adapter; with `check`, fails on any drift instead. */
export const runGenerate = Effect.fn("commands.generate")(function* (
  repoDir: string,
  check: boolean,
) {
  const fs = yield* FileSystem.FileSystem;
  const agentsDir = join(repoDir, "agents");
  const drifted: Array<string> = [];
  const skills = yield* readSkillSources(repoDir);
  let written = 0;

  for (const entry of yield* fs.readDirectory(agentsDir)) {
    const agentDir = join(agentsDir, entry);
    if (!(yield* isAgentSourceDirectory(fs, agentDir))) {
      continue;
    }
    const spec = yield* loadAgentSpec(agentDir, entry, skills);
    for (const rendered of renderAgent(agentDir, spec)) {
      if (yield* syncAdapter(fs, rendered, check, drifted)) {
        written += 1;
      }
    }
  }

  if (check && drifted.length > 0) {
    return yield* new GeneratorDriftError({
      message: "Generated adapters are out of date. Run `equip-it generate`.",
      files: drifted,
    });
  }
  yield* Console.log(check ? "ok: generated adapters are current" : `ok: ${written} files written`);
});
