import { spawnSync } from "node:child_process";

// Publishing is reserved for the release workflow, which authenticates to npm
// through trusted publishing (OIDC). A local publish would bypass provenance
// and the checks that gate the workflow, so refuse anything that is not a
// GitHub Actions job with an OIDC token available.
const tokenUrl = process.env["ACTIONS_ID_TOKEN_REQUEST_URL"];
if (process.env["GITHUB_ACTIONS"] !== "true" || tokenUrl === undefined || tokenUrl === "") {
  console.error(
    "Refusing to publish outside GitHub Actions. Merge the Version Packages pull request; release.yml publishes through npm trusted publishing.",
  );
  process.exit(1);
}

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const result = spawnSync(pnpm, ["exec", "changeset", "publish"], { stdio: "inherit" });
process.exit(result.status ?? 1);
