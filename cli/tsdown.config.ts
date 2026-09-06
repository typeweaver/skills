import { defineConfig } from "tsdown";

// The CLI ships as one self-contained file so `npx equip-it` never depends on
// how a consumer's package manager resolves effect's peer ranges. The bundle
// lives at the same depth as the compiled `dist/src/bin.js`, so the relative
// lookups for `package.json` and `content/` keep working unchanged.
export default defineConfig({
  entry: { "equip-it": "src/bin.ts" },
  outDir: "dist/bin",
  format: "esm",
  platform: "node",
  target: "node22",
  noExternal: /.*/,
  dts: false,
  clean: false,
  fixedExtension: false,
  shims: true,
});
