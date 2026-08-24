import type { PlatformError } from "effect";
import { Console, Effect, FileSystem } from "effect";
import { join } from "node:path";
import YAML from "yaml";
import type { AdapterSpec, AgentSpec } from "../agent-adapters.js";
import { ADAPTER_FILES } from "../agent-adapters.js";
import { isRecord } from "../domain.js";
import { AgentSourceError, GeneratorDriftError } from "../errors.js";

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
    const value: unknown = YAML.parse(raw);
    const declaredName = isRecord(value) ? value["name"] : undefined;
    const description = isRecord(value) ? value["description"] : undefined;
    const adapters = isRecord(value) ? value["adapters"] : undefined;
    if (
      !isRecord(value) ||
      typeof declaredName !== "string" ||
      typeof description !== "string" ||
      !isRecord(adapters)
    ) {
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
      if (!isRecord(entry)) {
        return yield* new AgentSourceError({
          message: `agents/${agentName}/agent.yaml: adapter '${key}' must be a mapping`,
        });
      }
      const description = entry["description"];
      const frontmatter = entry["frontmatter"];
      adapters[key] = {
        ...(typeof description === "string" ? { description } : {}),
        ...(isRecord(frontmatter) ? { frontmatter } : {}),
      };
    }
    return adapters;
  });

const renderAgent = (
  agentDir: string,
  spec: AgentSpec,
): ReadonlyArray<{ readonly target: string; readonly content: string; readonly label: string }> =>
  ADAPTER_FILES.filter((adapter) => spec.adapters[adapter.key] !== undefined).map((adapter) => ({
    target: join(agentDir, adapter.file),
    content: adapter.render(spec),
    label: `agents/${spec.name}/${adapter.file}`,
  }));

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
    if ((yield* fs.stat(agentDir)).type !== "Directory") {
      continue;
    }
    if (!(yield* fs.exists(join(agentDir, "agent.yaml")))) {
      continue;
    }
    const spec = yield* loadAgentSpec(agentDir, entry);

    for (const rendered of renderAgent(agentDir, spec)) {
      const current = (yield* fs.exists(rendered.target))
        ? yield* fs.readFileString(rendered.target)
        : undefined;
      if (current === rendered.content) {
        continue;
      }
      if (check) {
        drifted.push(rendered.label);
        continue;
      }
      yield* fs.writeFileString(rendered.target, rendered.content);
      written += 1;
      yield* Console.log(`generated ${rendered.label}`);
    }
  }

  if (check && drifted.length > 0) {
    return yield* new GeneratorDriftError({
      message: "Generated adapters are out of date. Run `typeweaver-skills generate`.",
      files: drifted,
    });
  }
  yield* Console.log(check ? "ok: generated adapters are current" : `ok: ${written} files written`);
});
