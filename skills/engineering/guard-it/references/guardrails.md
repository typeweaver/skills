# Guardrail settings by layer

Facts that change between tool versions. Verify against the installed
versions before proposing; the skill body owns the procedure.

## Compiler

- TypeScript 7 defaults to `strict: true`, `types: []`, `rootDir: "./"`,
  `module: esnext`, and removes `baseUrl`. Earlier majors default to
  non-strict and `types: ["*"]`; read the installed version.
- Strict extras worth proposing: `exactOptionalPropertyTypes`,
  `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`,
  `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`,
  `isolatedModules`, and an explicit `types` list.
- Scope `include` or project references so type-aware tools stay fast.

## Type-aware lint

- oxlint with `oxlint-tsgolint` covers most typescript-eslint type-aware rules
  and runs on the TypeScript 7 (tsgo) engine; verify the installed TypeScript
  against the tool's current compatibility note. Prefer it when its typed and
  ecosystem coverage satisfies the repository's policy, otherwise keep and
  strengthen typescript-eslint `strict-type-checked`.
- Rules with the highest payoff against agent-written defects: floating and
  misused promises, unsafe `any` flows, strict boolean expressions, exhaustive
  switches, unused declarations and directives, consistent type imports,
  `max-lines`, cognitive complexity.
- oxlint: `respectEslintDisableDirectives: false` and
  `reportUnusedDisableDirectives: "error"` remove the inline escape hatch.
- Boundaries: scoped `no-restricted-imports` overrides per folder enforce
  import direction without a second tool, and also catch type-only edges that
  `import-x/no-cycle` does not count.

## Framework analyzers

- Language-service plugins and their lint integrations often emit the same
  diagnostic; give it one owner (for example disable the plugin's diagnostics
  when the linter carries the rule).
- Pin the plugin, the linter, and the type-checker to mutually compatible
  versions in one place.

## Format

- oxfmt with oxlint; prettier with the typescript-eslint family. Check mode in
  CI only.

## Dead code and dependencies

- knip finds unused files, exports, and dependencies. `--production --strict`
  suits published libraries; applications use the default mode, because
  production mode skips devDependencies and weakens the gate.

## Module boundaries

- dependency-cruiser validates cycles, orphans, and forbidden edges by path
  rule when the linter's restricted-import rules are not enough.

## Supply chain

- pnpm: `minimumReleaseAge` (minutes); `strictDepBuilds` with `allowBuilds`
  entries `name: true|false` written by hand (`pnpm approve-builds` is
  interactive and cannot deny; pnpm 10.26+, earlier releases use
  `onlyBuiltDependencies`, removed in v11). A denial added after install keeps
  failing until `node_modules` is reinstalled. CI installs with
  `--frozen-lockfile`.
- GitHub Actions: pin every action to a commit SHA with a version comment,
  least-privilege `permissions`, `persist-credentials: false` where nothing
  pushes, and audit with zizmor through its pinned action or `pipx`; zizmor is
  not an npm package.

## Published packages

- publint validates the manifest; a packed-tarball smoke test installs with
  npm into an empty project and runs the binary, because npm and pnpm resolve
  peers differently.
