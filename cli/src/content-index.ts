import { lstatSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

export type SkillSource = {
  readonly directory: string;
  readonly files: ReadonlyArray<string>;
};

export type AgentSource = {
  readonly directory: string;
  readonly adapters: ReadonlySet<string>;
};

export type ContentIndex = {
  readonly skills: ReadonlyMap<string, SkillSource>;
  readonly agents: ReadonlyMap<string, AgentSource>;
};

const listDirectories = (directory: string): ReadonlyArray<string> =>
  readdirSync(directory)
    .filter((entry) => lstatSync(join(directory, entry)).isDirectory())
    .toSorted();

const listFiles = (directory: string): ReadonlyArray<string> => {
  const files: Array<string> = [];
  const visit = (current: string): void => {
    for (const entry of readdirSync(current).toSorted()) {
      const path = join(current, entry);
      const stat = lstatSync(path);
      if (stat.isSymbolicLink()) {
        throw new Error(`Bundled content must not contain symlinks: ${path}`);
      }
      if (stat.isDirectory()) {
        visit(path);
      } else if (stat.isFile()) {
        files.push(relative(directory, path).split(sep).join("/"));
      } else {
        throw new Error(`Unsupported bundled content entry: ${path}`);
      }
    }
  };
  visit(directory);
  return files;
};

export const indexContent = (root: string): ContentIndex => {
  const skills = new Map<string, SkillSource>();
  for (const bucket of listDirectories(join(root, "skills"))) {
    for (const name of listDirectories(join(root, "skills", bucket))) {
      const directory = join(root, "skills", bucket, name);
      if (skills.has(name)) {
        throw new Error(`Duplicate bundled skill name: ${name}`);
      }
      skills.set(name, { directory, files: listFiles(directory) });
    }
  }
  const agents = new Map<string, AgentSource>();
  for (const name of listDirectories(join(root, "agents"))) {
    const directory = join(root, "agents", name);
    agents.set(name, { directory, adapters: new Set(readdirSync(directory)) });
  }
  return { skills, agents };
};
