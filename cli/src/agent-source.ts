import { Effect } from "effect";
import YAML from "yaml";
import type { AdapterSpec, AgentSpec, PreloadedSkill } from "./agent-adapters.js";
import { isRecord } from "./domain.js";
import { AgentSourceError } from "./errors.js";

/** Canonical `SKILL.md` content keyed by repository skill name. */
export type SkillSources = ReadonlyMap<string, string>;

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  isRecord(value) ? value : undefined;

const frontmatterPattern = /^---\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/u;

/** Removes a leading YAML frontmatter block, leaving the canonical body. */
const stripFrontmatter = (markdown: string): string =>
  markdown.replace(frontmatterPattern, "").trim();

const referenceDefinitionPattern = /\[.*\]:/u;
const htmlAttributePattern = /\b(href|src)\s*=/iu;
const uriAutolinkPattern = /<[a-z][a-z0-9+.-]*:[^<>\s]*>/iu;
const emailAutolinkPattern = /<[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+>/u;

/**
 * The first link-like syntax in an inlined skill body, or `undefined` when the
 * body is link-free. The contract is deliberately conservative: a preloaded
 * skill must contain no links at all, so fenced and inline examples are
 * rejected too and absolute links are not special-cased. An inlined skill
 * cannot follow a link because the target is not part of the adapter.
 */
const linkLikeSyntax = (markdown: string): string | undefined => {
  if (markdown.includes("](")) {
    return "an inline link or image marker ']('";
  }
  if (referenceDefinitionPattern.test(markdown)) {
    return "a Markdown reference definition";
  }
  const attribute = htmlAttributePattern.exec(markdown);
  if (attribute !== null) {
    return `an HTML '${(attribute[1] ?? "").toLowerCase()}' attribute`;
  }
  if (uriAutolinkPattern.test(markdown)) {
    return "a URI autolink";
  }
  if (emailAutolinkPattern.test(markdown)) {
    return "an email autolink";
  }
  return undefined;
};

const parsePreloadNames = (
  value: unknown,
  agentName: string,
): Effect.Effect<ReadonlyArray<string>, AgentSourceError> => {
  if (value === undefined) {
    return Effect.succeed([]);
  }
  if (!Array.isArray(value)) {
    return Effect.fail(
      new AgentSourceError({
        message: `agents/${agentName}/agent.yaml: preload must be a list of skill names`,
      }),
    );
  }
  const names: Array<string> = [];
  for (const entry of value) {
    if (typeof entry !== "string" || entry.trim() === "") {
      return Effect.fail(
        new AgentSourceError({
          message: `agents/${agentName}/agent.yaml: preload entries must be non-empty skill names`,
        }),
      );
    }
    if (names.includes(entry)) {
      return Effect.fail(
        new AgentSourceError({
          message: `agents/${agentName}/agent.yaml: duplicate preload skill '${entry}'`,
        }),
      );
    }
    names.push(entry);
  }
  return Effect.succeed(names);
};

const resolvePreloadedSkills = (
  names: ReadonlyArray<string>,
  skills: SkillSources,
  agentName: string,
): Effect.Effect<ReadonlyArray<PreloadedSkill>, AgentSourceError> =>
  Effect.gen(function* () {
    const preloaded: Array<PreloadedSkill> = [];
    for (const name of names) {
      const source = skills.get(name);
      if (source === undefined) {
        return yield* new AgentSourceError({
          message: `agents/${agentName}/agent.yaml: unknown preload skill '${name}'`,
        });
      }
      const instructions = stripFrontmatter(source);
      const link = linkLikeSyntax(instructions);
      if (link !== undefined) {
        return yield* new AgentSourceError({
          message:
            `agents/${agentName}/agent.yaml: preload skill '${name}' must be link-free; ` +
            `found ${link}`,
        });
      }
      preloaded.push({ name, instructions });
    }
    return preloaded;
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

type AgentHeader = {
  readonly description: string;
  readonly adapters: Record<string, unknown>;
  readonly preload: unknown;
};

const parseHeader = (source: string, name: string): Effect.Effect<AgentHeader, AgentSourceError> =>
  Effect.gen(function* () {
    const parsed = asRecord(YAML.parse(source));
    const declaredName = parsed?.["name"];
    const description = parsed?.["description"];
    const adapters = asRecord(parsed?.["adapters"]);
    const hasRequiredFields =
      typeof declaredName === "string" && typeof description === "string" && adapters !== undefined;
    if (parsed === undefined || !hasRequiredFields) {
      return yield* new AgentSourceError({
        message: `agents/${name}/agent.yaml must declare name, description, and adapters`,
      });
    }
    if (declaredName !== name) {
      return yield* new AgentSourceError({
        message: `agents/${name}/agent.yaml declares name '${declaredName}'`,
      });
    }
    return { description, adapters, preload: parsed["preload"] };
  });

const validateClaudeSkills = (
  preload: ReadonlyArray<PreloadedSkill>,
  adapters: AgentSpec["adapters"],
  name: string,
): Effect.Effect<void, AgentSourceError> => {
  const declared = adapters["claude-code"]?.frontmatter?.["skills"];
  if (declared === undefined) {
    return Effect.void;
  }
  if (!Array.isArray(declared)) {
    return Effect.fail(
      new AgentSourceError({
        message: `agents/${name}/agent.yaml: claude-code frontmatter.skills must be a list of skill names`,
      }),
    );
  }
  const entries: ReadonlyArray<unknown> = declared;
  const names: Array<string> = [];
  for (const entry of entries) {
    if (typeof entry !== "string") {
      return Effect.fail(
        new AgentSourceError({
          message: `agents/${name}/agent.yaml: claude-code frontmatter.skills must be a list of skill names`,
        }),
      );
    }
    names.push(entry);
  }
  const preloadNames = new Set(preload.map((skill) => skill.name));
  const overlap = names.filter((skill) => preloadNames.has(skill));
  if (overlap.length > 0) {
    return Effect.fail(
      new AgentSourceError({
        message:
          `agents/${name}/agent.yaml: claude-code frontmatter.skills duplicates ` +
          `the inlined preload: ${overlap.join(", ")}`,
      }),
    );
  }
  return Effect.void;
};

/**
 * Parses one agent source into a renderable spec, resolving its `preload`
 * names against canonical `SKILL.md` sources. Unknown and duplicate names, a
 * non-list `preload`, and a skill that is not link-free fail with a message
 * naming the agent and the offending skill.
 */
export const parseAgentSource = (
  source: string,
  name: string,
  instructions: string,
  skills: SkillSources,
): Effect.Effect<AgentSpec, AgentSourceError> =>
  Effect.gen(function* () {
    const header = yield* parseHeader(source, name);
    const names = yield* parsePreloadNames(header.preload, name);
    const preload = yield* resolvePreloadedSkills(names, skills, name);
    const adapters = yield* parseAdapters(header.adapters, name);
    yield* validateClaudeSkills(preload, adapters, name);
    return { name, description: header.description, instructions, preload, adapters };
  });
