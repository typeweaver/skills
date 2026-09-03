import type { PlatformError } from "effect";
import { Console, Effect, FileSystem } from "effect";
import { join } from "node:path";
import YAML from "yaml";
import type { AdapterSpec, AgentSpec } from "../agent-adapters.js";
import { ADAPTER_FILES } from "../agent-adapters.js";
import { isRecord } from "../domain.js";
import { AgentSourceError, GeneratorDriftError } from "../errors.js";

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  isRecord(value) ? value : undefined;

const loadAgentSpec = (
  agentDir: string,
  name: string,
): Effect.Effect<
  AgentSpec,
  AgentSourceError | PlatformError.PlatformError,
  FileSystem.FileSystem
> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const raw = yield* fs.readFileString(join(agentDir, "agent.yaml"));
    const instructions = yield* fs.readFileString(join(agentDir, "instructions.md"));
    const source = asRecord(YAML.parse(raw));
    const declaredName = source?.["name"];
    const description = source?.["description"];
    const adapters = asRecord(source?.["adapters"]);
    const hasRequiredFields =
      typeof declaredName === "string" && typeof description === "string" && adapters !== undefined;
    if (source === undefined || !hasRequiredFields) {
      return yield* new AgentSourceError({
        message: `agents/${name}/agent.yaml must declare name, description, and adapters`,
      });
    }
    if (declaredName !== name) {
      return yield* new AgentSourceError({
        message: `agents/${name}/agent.yaml declares name '${declaredName}'`,
      });
    }
    return {
      name: declaredName,
      description,
      instructions,
      adapters: yield* parseAdapters(adapters, name),
    };
  });

const parseAdapters = (
  value: Record<string, unknown>,
  agentName: string,
): Effect.Effect<AgentSpec["adapters"], AgentSourceError> =>
  Effect.gen(function* () {
    const adapters: Record<string, AdapterSpec> = {};
    for (const [key, entry] of Object.entries(value)) {
      const mapping = asRecord(entry);
      if (mapping === undefined) {
        return yield* new AgentSourceError({
          message: `agents/${agentName}/agent.yaml: adapter '${key}' must be a mapping`,
        });
      }
      const description = mapping["description"];
      const frontmatter = mapping["frontmatter"];
      adapters[key] = {
        ...(typeof description === "string" ? { description } : {}),
        ...(isRecord(frontmatter) ? { frontmatter } : {}),
      };
    }
    return adapters;
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
  let written = 0;

  for (const entry of yield* fs.readDirectory(agentsDir)) {
    const agentDir = join(agentsDir, entry);
    if (!(yield* isAgentSourceDirectory(fs, agentDir))) {
      continue;
    }
    const spec = yield* loadAgentSpec(agentDir, entry);
    for (const rendered of renderAgent(agentDir, spec)) {
      if (yield* syncAdapter(fs, rendered, check, drifted)) {
        written += 1;
      }
    }
  }

  if (check && drifted.length > 0) {
    return yield* new GeneratorDriftError({
      message: "Generated adapters are out of date. Run `skill-it generate`.",
      files: drifted,
    });
  }
  yield* Console.log(check ? "ok: generated adapters are current" : `ok: ${written} files written`);
});
