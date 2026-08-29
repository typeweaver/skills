import { Console, Effect, Option } from "effect";
import { Command, Flag, Prompt } from "effect/unstable/cli";
import type { ContentSelection, Harness, SkillMode } from "./domain.js";
import { HARNESSES } from "./domain.js";
import { contentRoot, indexContent } from "./content.js";
import { detectHarnesses, envFromProcess } from "./env.js";
import { NoHarnessDetectedError, NonInteractiveWithoutFlagsError } from "./errors.js";
import { runInstall } from "./commands/install.js";
import { harnessFlag, mutationFlags, packageVersion, parseSelection } from "./cli-shared.js";

const installFlags = {
  "claude-code": harnessFlag("claude-code", "Install for Claude Code"),
  codex: harnessFlag("codex", "Install for Codex"),
  opencode: harnessFlag("opencode", "Install for OpenCode"),
  kiro: harnessFlag("kiro", "Install for Kiro (skills only)"),
  skills: Flag.string("skills").pipe(
    Flag.optional,
    Flag.withDescription("Comma-separated skill names, 'all', or 'none'"),
  ),
  agents: Flag.string("agents").pipe(
    Flag.optional,
    Flag.withDescription("Comma-separated agent names, 'all', or 'none'"),
  ),
  copy: Flag.boolean("copy").pipe(
    Flag.withDefault(false),
    Flag.withDescription("Copy skills into harness roots instead of linking to ~/.agents/skills"),
  ),
  yes: Flag.boolean("yes").pipe(
    Flag.withDefault(false),
    Flag.withAlias("y"),
    Flag.withDescription("Skip prompts; never implies --force"),
  ),
  ...mutationFlags,
};

type InstallConfig = {
  readonly "claude-code": boolean;
  readonly codex: boolean;
  readonly opencode: boolean;
  readonly kiro: boolean;
  readonly skills: Option.Option<string>;
  readonly agents: Option.Option<string>;
  readonly copy: boolean;
  readonly yes: boolean;
  readonly force: boolean;
  readonly dryRun: boolean;
};

const promptSelection = (label: "skills" | "agents", available: ReadonlyArray<string>) =>
  Prompt.multiSelect({
    message: `Which ${label} should be installed?`,
    choices: available.map((name) => ({ title: name, value: name, selected: true })),
  }).pipe(
    Effect.map((names): ContentSelection =>
      names.length === 0 ? { kind: "none" } : { kind: "names", names },
    ),
  );

const flaggedSelection = (value: Option.Option<string>): ContentSelection | undefined =>
  Option.isSome(value) ? parseSelection(value.value) : undefined;

const defaultSkillSelection = (interactive: boolean, names: ReadonlyArray<string>) =>
  interactive ? promptSelection("skills", names) : Effect.succeed({ kind: "all" } as const);

const defaultAgentSelection = (
  interactive: boolean,
  harnesses: ReadonlyArray<Harness>,
  names: ReadonlyArray<string>,
) => {
  if (harnesses.every((harness) => harness === "kiro")) {
    return Effect.succeed({ kind: "none" } as const);
  }
  if (interactive) {
    return promptSelection("agents", names);
  }
  return Effect.succeed({ kind: "all" } as const);
};

const resolveSelections = (config: InstallConfig, harnesses: ReadonlyArray<Harness>) =>
  Effect.gen(function* () {
    const index = indexContent(contentRoot());
    const interactive = !config.yes && process.stdout.isTTY;
    const skillNames = Array.from(index.skills.keys()).toSorted();
    const agentNames = Array.from(index.agents.keys()).toSorted();
    const skills =
      flaggedSelection(config.skills) ?? (yield* defaultSkillSelection(interactive, skillNames));
    const agents =
      flaggedSelection(config.agents) ??
      (yield* defaultAgentSelection(interactive, harnesses, agentNames));
    return { skills, agents };
  });

const selectHarnesses = (config: InstallConfig) =>
  Effect.gen(function* () {
    const flagged = HARNESSES.filter((harness) => config[harness]);
    if (flagged.length > 0) {
      return flagged;
    }
    const detected = yield* detectHarnesses(envFromProcess());
    if (config.yes) {
      return detected;
    }
    if (!process.stdout.isTTY) {
      return yield* new NonInteractiveWithoutFlagsError({
        message:
          "No TTY and no harness flags. Pass explicit harnesses and selections, then add --yes.",
      });
    }
    yield* Console.log(`Detected: ${detected.length > 0 ? detected.join(", ") : "none"}`);
    return yield* Prompt.multiSelect({
      message: "Which harnesses should receive the setup?",
      choices: HARNESSES.map((harness) => ({
        title: harness,
        value: harness,
        selected: detected.includes(harness),
      })),
    });
  });

const resolveHarnesses = (config: InstallConfig) =>
  Effect.gen(function* () {
    const harnesses = yield* selectHarnesses(config);
    if (harnesses.length === 0) {
      return yield* new NoHarnessDetectedError({
        message: "No harness selected or detected.",
      });
    }
    return harnesses;
  });

const resolveSkillMode = (
  config: InstallConfig,
  harnesses: ReadonlyArray<Harness>,
  skills: ContentSelection,
) =>
  Effect.gen(function* () {
    if (config.copy) {
      return "copy" as const;
    }
    const needsProjection = harnesses.includes("claude-code") || harnesses.includes("kiro");
    if (config.yes || !process.stdout.isTTY || skills.kind === "none" || !needsProjection) {
      return "symlink" as const;
    }
    return yield* Prompt.select<SkillMode>({
      message: "How should skills be projected to harness-specific directories?",
      choices: [
        { title: "Symlink to ~/.agents/skills (recommended)", value: "symlink" },
        { title: "Copy independent skill directories", value: "copy" },
      ],
    });
  });

export const installCommand = Command.make("install", installFlags, (config) =>
  Effect.gen(function* () {
    const harnesses = yield* resolveHarnesses(config);
    const { skills, agents } = yield* resolveSelections(config, harnesses);
    const mode = yield* resolveSkillMode(config, harnesses, skills);
    yield* runInstall(
      {
        harnesses,
        skills,
        agents,
        mode,
        force: config.force,
        dryRun: config.dryRun,
      },
      yield* packageVersion,
    );
  }),
).pipe(Command.withDescription("Add selected skills and native agent adapters safely"));
