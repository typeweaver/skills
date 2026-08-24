import type { PlatformError } from "effect";
import { Effect, FileSystem } from "effect";
import { dirname, join } from "node:path";
import type { DesiredFile, Env, Harness } from "./domain.js";
import { sha256 } from "./domain.js";

/** Root of the content bundled into the published package. */
export const contentRoot = (): string => join(dirname(dirname(import.meta.dirname)), "content");

type Fx<A> = Effect.Effect<A, PlatformError.PlatformError, FileSystem.FileSystem>;

export type ContentIndex = {
  /** skill name -> file paths relative to the skill directory */
  readonly skills: ReadonlyMap<string, ReadonlyArray<string>>;
  /** agent name -> adapter file names present for it */
  readonly agents: ReadonlyMap<string, ReadonlyArray<string>>;
};

const listFiles = (root: string): Fx<ReadonlyArray<string>> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const entries = yield* fs.readDirectory(root, { recursive: true });
    const files: Array<string> = [];
    for (const entry of entries) {
      if ((yield* fs.stat(join(root, entry))).type === "File") {
        files.push(entry);
      }
    }
    return files;
  });

const listDirectories = (root: string): Fx<ReadonlyArray<string>> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const dirs: Array<string> = [];
    for (const entry of yield* fs.readDirectory(root)) {
      if ((yield* fs.stat(join(root, entry))).type === "Directory") {
        dirs.push(entry);
      }
    }
    return dirs;
  });

export const indexContent = (root: string): Fx<ContentIndex> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const skills = new Map<string, ReadonlyArray<string>>();
    for (const bucket of yield* listDirectories(join(root, "skills"))) {
      for (const skill of yield* listDirectories(join(root, "skills", bucket))) {
        skills.set(skill, yield* listFiles(join(root, "skills", bucket, skill)));
      }
    }
    const agents = new Map<string, ReadonlyArray<string>>();
    for (const agent of yield* listDirectories(join(root, "agents"))) {
      agents.set(agent, yield* fs.readDirectory(join(root, "agents", agent)));
    }
    return { skills, agents };
  });

/** Directories that receive skill copies for the selected harnesses. */
const skillRoots = (harnesses: ReadonlyArray<Harness>, env: Env): ReadonlyArray<string> => {
  const roots: Array<string> = [];
  const wantsShared = harnesses.includes("codex") || harnesses.includes("opencode");
  if (wantsShared) {
    roots.push(join(env.home, ".agents", "skills"));
  }
  if (harnesses.includes("claude-code")) {
    roots.push(join(env.home, ".claude", "skills"));
  }
  if (harnesses.includes("kiro")) {
    roots.push(join(env.home, ".kiro", "skills"));
  }
  return roots;
};

/** Where each adapter file of an agent belongs, per harness. */
const adapterTargets = (
  agent: string,
  env: Env,
): ReadonlyArray<{
  readonly adapter: string;
  readonly harness: Harness;
  readonly target: string;
}> => [
  {
    adapter: "claude.md",
    harness: "claude-code",
    target: join(env.home, ".claude", "agents", `${agent}.md`),
  },
  {
    adapter: "opencode.md",
    harness: "opencode",
    target: join(env.configHome, "opencode", "agents", `${agent}.md`),
  },
  {
    adapter: "codex.toml",
    harness: "codex",
    target: join(env.codexHome, "agents", `${agent}.toml`),
  },
  {
    adapter: "codex-profile.toml",
    harness: "codex",
    target: join(env.codexHome, `${agent}.config.toml`),
  },
];

const skillFiles = (
  root: string,
  skill: string,
  relativeFiles: ReadonlyArray<string>,
  roots: ReadonlyArray<string>,
): Fx<ReadonlyArray<DesiredFile>> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const out: Array<DesiredFile> = [];
    for (const rel of relativeFiles) {
      const content = yield* fs.readFile(join(root, "skills", "engineering", skill, rel));
      const hash = sha256(content);
      out.push(...roots.map((dir) => ({ target: join(dir, skill, rel), content, hash })));
    }
    return out;
  });

type AgentFilesOptions = {
  readonly root: string;
  readonly agent: string;
  readonly presentAdapters: ReadonlyArray<string>;
  readonly harnesses: ReadonlyArray<Harness>;
  readonly env: Env;
};

const agentFiles = ({
  agent,
  env,
  harnesses,
  presentAdapters,
  root,
}: AgentFilesOptions): Fx<ReadonlyArray<DesiredFile>> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const wanted = adapterTargets(agent, env).filter(
      (entry) => presentAdapters.includes(entry.adapter) && harnesses.includes(entry.harness),
    );
    const out: Array<DesiredFile> = [];
    for (const entry of wanted) {
      const content = yield* fs.readFile(join(root, "agents", agent, entry.adapter));
      out.push({ target: entry.target, content, hash: sha256(content) });
    }
    return out;
  });

/**
 * Maps the selected harnesses and content to the concrete files an
 * installation must create.
 */
export type DesiredFilesOptions = {
  readonly root: string;
  readonly index: ContentIndex;
  readonly harnesses: ReadonlyArray<Harness>;
  readonly skills: ReadonlyArray<string>;
  readonly agents: ReadonlyArray<string>;
  readonly env: Env;
};

export const desiredFiles = (options: DesiredFilesOptions): Fx<ReadonlyArray<DesiredFile>> =>
  Effect.gen(function* () {
    const { agents, env, harnesses, index, root, skills } = options;
    const roots = skillRoots(harnesses, env);
    const out: Array<DesiredFile> = [];
    for (const skill of skills) {
      out.push(...(yield* skillFiles(root, skill, index.skills.get(skill) ?? [], roots)));
    }
    for (const agent of agents) {
      out.push(
        ...(yield* agentFiles({
          agent,
          env,
          harnesses,
          presentAdapters: index.agents.get(agent) ?? [],
          root,
        })),
      );
    }
    return out;
  });
