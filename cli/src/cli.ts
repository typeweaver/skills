import { Console, Effect, FileSystem } from "effect";
import { Command, Flag, Prompt } from "effect/unstable/cli";
import { dirname, join } from "node:path";
import type { Harness } from "./domain.js";
import { HARNESSES, isRecord } from "./domain.js";
import { detectHarnesses, envFromProcess } from "./env.js";
import { NoHarnessDetectedError, NonInteractiveWithoutFlagsError } from "./errors.js";
import { runDoctor } from "./commands/doctor.js";
import { runGenerate } from "./commands/generate.js";
import { runInstall } from "./commands/install.js";
import { runUninstall } from "./commands/uninstall.js";
import { runUpdate } from "./commands/update.js";

/** Splits a comma-separated flag value ("a,b,c") into its entries. */
const parseCommaList = (value: string): ReadonlyArray<string> =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

const packageVersion: Effect.Effect<string, never, FileSystem.FileSystem> = Effect.gen(
  function* () {
    const fs = yield* FileSystem.FileSystem;
    const pkgPath = join(dirname(dirname(import.meta.dirname)), "package.json");
    const raw = yield* fs.readFileString(pkgPath);
    const value: unknown = JSON.parse(raw);
    return isRecord(value) && typeof value["version"] === "string" ? value["version"] : "0.0.0";
  },
).pipe(Effect.orElseSucceed(() => "0.0.0"));

const harnessFlag = (name: Harness, description: string) =>
  Flag.boolean(name).pipe(Flag.withDefault(false), Flag.withDescription(description));

const installFlags = {
  "claude-code": harnessFlag("claude-code", "Install for Claude Code"),
  codex: harnessFlag("codex", "Install for Codex"),
  opencode: harnessFlag("opencode", "Install for OpenCode"),
  kiro: harnessFlag("kiro", "Install for Kiro (skills only)"),
  skills: Flag.string("skills").pipe(
    Flag.withDefault("all"),
    Flag.withDescription("Comma-separated skill names, or 'all'"),
  ),
  agents: Flag.string("agents").pipe(
    Flag.withDefault("all"),
    Flag.withDescription("Comma-separated agent names, or 'all'"),
  ),
  yes: Flag.boolean("yes").pipe(
    Flag.withDefault(false),
    Flag.withAlias("y"),
    Flag.withDescription("Skip prompts; use detected harnesses"),
  ),
  dryRun: Flag.boolean("dry-run").pipe(
    Flag.withDefault(false),
    Flag.withDescription("Show the plan without changing anything"),
  ),
};

type InstallConfig = {
  readonly [K in keyof typeof installFlags]: K extends "skills" | "agents" ? string : boolean;
};

/**
 * Resolves which harnesses to target: explicit flags win; otherwise `--yes`
 * takes the detected ones, a TTY asks, and a non-TTY without flags fails with
 * guidance so automation never installs implicitly.
 */
const resolveHarnesses = (config: InstallConfig) =>
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
          "No TTY and no harness flags. Pass explicit flags, e.g. " +
          "`typeweaver-skills install --claude-code --codex --skills all --agents all --yes`.",
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

const install = Command.make("install", installFlags, (config) =>
  Effect.gen(function* () {
    const harnesses = yield* resolveHarnesses(config);
    if (harnesses.length === 0) {
      yield* new NoHarnessDetectedError({
        message:
          "No harness selected or detected (~/.claude, ~/.codex, ~/.config/opencode, ~/.kiro).",
      });
    }
    yield* runInstall(
      {
        harnesses,
        skills: config.skills === "all" ? [] : parseCommaList(config.skills),
        agents: config.agents === "all" ? [] : parseCommaList(config.agents),
        dryRun: config.dryRun,
      },
      yield* packageVersion,
    );
  }),
).pipe(Command.withDescription("Install skills and agents into the selected harnesses"));

const update = Command.make("update", {}, () =>
  Effect.gen(function* () {
    yield* runUpdate(yield* packageVersion);
  }),
).pipe(Command.withDescription("Refresh every managed file from this package version"));

const doctor = Command.make("doctor", {}, () =>
  Effect.gen(function* () {
    yield* runDoctor(yield* packageVersion);
  }),
).pipe(Command.withDescription("Verify the managed installation"));

const uninstall = Command.make("uninstall", {}, () => runUninstall()).pipe(
  Command.withDescription("Remove every managed file"),
);

const generate = Command.make(
  "generate",
  {
    repo: Flag.string("repo").pipe(
      Flag.withDefault("."),
      Flag.withDescription("Path to the typeweaver/skills repository"),
    ),
    check: Flag.boolean("check").pipe(
      Flag.withDefault(false),
      Flag.withDescription("Fail when generated adapters are out of date"),
    ),
  },
  (config) => runGenerate(config.repo, config.check),
).pipe(Command.withDescription("Generate harness adapter files from each agent's source of truth"));

export const root = Command.make("typeweaver-skills").pipe(
  Command.withDescription("Skills and agents for Claude Code, Codex, OpenCode, and Kiro"),
  Command.withSubcommands([install, update, doctor, uninstall, generate]),
);

export const runCli = (argv: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    const version = yield* packageVersion;
    yield* Command.runWith(root, { version })(argv);
  });
