import { Console, Effect, Runtime } from "effect";
import { CliError, Command, Flag } from "effect/unstable/cli";
import { HARNESSES } from "./domain.js";
import { runDoctor } from "./commands/doctor.js";
import { runGenerate } from "./commands/generate.js";
import { runUninstall } from "./commands/uninstall.js";
import { runUpdate } from "./commands/update.js";
import { installCommand } from "./cli-install.js";
import {
  acceptedYesFlag,
  harnessFlag,
  mutationFlags,
  packageVersion,
  parseSelection,
} from "./cli-shared.js";

const update = Command.make("update", { ...mutationFlags, ...acceptedYesFlag }, (config) =>
  Effect.gen(function* () {
    yield* runUpdate(yield* packageVersion, config);
  }),
).pipe(Command.withDescription("Update only the components recorded in Receipt v2"));

const doctor = Command.make("doctor", {}, () =>
  Effect.gen(function* () {
    yield* runDoctor(yield* packageVersion);
  }),
).pipe(Command.withDescription("Read-only verification of roots, receipt, and artifacts"));

const uninstallFlags = {
  "claude-code": harnessFlag("claude-code", "Remove selected consumers from Claude Code"),
  codex: harnessFlag("codex", "Remove selected consumers from Codex"),
  opencode: harnessFlag("opencode", "Remove selected consumers from OpenCode"),
  kiro: harnessFlag("kiro", "Remove selected consumers from Kiro"),
  skills: Flag.string("skills").pipe(
    Flag.withDefault(""),
    Flag.withDescription("Limit removal to skill names, 'all', or 'none'"),
  ),
  agents: Flag.string("agents").pipe(
    Flag.withDefault(""),
    Flag.withDescription("Limit removal to agent names, 'all', or 'none'"),
  ),
  ...mutationFlags,
  ...acceptedYesFlag,
};

const uninstall = Command.make("uninstall", uninstallFlags, (config) =>
  Effect.gen(function* () {
    const harnesses = HARNESSES.filter((harness) => config[harness]);
    yield* runUninstall(yield* packageVersion, {
      force: config.force,
      dryRun: config.dryRun,
      ...(harnesses.length === 0 ? {} : { harnesses }),
      ...(config.skills === "" ? {} : { skills: parseSelection(config.skills) }),
      ...(config.agents === "" ? {} : { agents: parseSelection(config.agents) }),
    });
  }),
).pipe(Command.withDescription("Remove the full installation or selected components/consumers"));

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

export const root = Command.make("equip-it").pipe(
  Command.withDescription("Filesystem-safe Typeweaver skills and agent adapter installer"),
  Command.withSubcommands([installCommand, update, doctor, uninstall, generate]),
);

/**
 * Runs the public `equip-it` CLI.
 *
 * @param argv - Arguments after the node executable and script path, as in
 *   `process.argv.slice(2)`.
 */
export const runCli = (argv: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    const version = yield* packageVersion;
    yield* Command.runWith(root, { version })(argv);
  }).pipe(
    Effect.tapError((error) =>
      isExpectedError(error) ? Console.error(formatExpectedError(error)) : Effect.void,
    ),
  );

/**
 * Expected outcomes (conflicts, missing receipts, drift) are user-facing
 * results, not defects. They carry `Runtime.errorReported = false`, so the
 * runtime does not log them; the CLI prints their message instead and still
 * exits with code 1. The parser's own errors (help, unknown flags) are
 * rendered by `Command.runWith` and are excluded here.
 */
export const isExpectedError = (error: unknown): error is { readonly message: string } =>
  typeof error === "object" &&
  error !== null &&
  !CliError.isCliError(error) &&
  !Runtime.getErrorReported(error) &&
  "message" in error &&
  typeof error.message === "string";

export const formatExpectedError = (error: { readonly message: string }): string => {
  const files = "files" in error && Array.isArray(error.files) ? error.files : [];
  return [error.message, ...files.map((file) => `  ${String(file)}`)].join("\n");
};
