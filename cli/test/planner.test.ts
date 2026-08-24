import assert from "node:assert/strict";
import { test } from "node:test";
import type { Receipt } from "../src/domain.js";
import { nextReceiptFiles, planInstall, planOrphans } from "../src/planner.js";

const receipt = (files: Record<string, string>): Receipt => ({
  packageVersion: "1.0.0",
  harnesses: ["claude-code"],
  files,
});

test("creates missing files", () => {
  const plan = planInstall(new Map([["/t/a", "h1"]]), new Map([["/t/a", undefined]]), receipt({}));
  assert.deepEqual(plan.actions, [{ _tag: "Create", target: "/t/a" }]);
});

test("leaves identical files unchanged (idempotent re-run)", () => {
  const plan = planInstall(new Map([["/t/a", "h1"]]), new Map([["/t/a", "h1"]]), receipt({}));
  assert.deepEqual(plan.actions, [{ _tag: "Unchanged", target: "/t/a" }]);
});

test("updates files we manage when the package content changed", () => {
  const plan = planInstall(
    new Map([["/t/a", "h2"]]),
    new Map([["/t/a", "h1"]]),
    receipt({ "/t/a": "h1" }),
  );
  assert.deepEqual(plan.actions, [{ _tag: "Update", target: "/t/a" }]);
});

test("preserves files the user modified after we installed them", () => {
  const plan = planInstall(
    new Map([["/t/a", "h2"]]),
    new Map([["/t/a", "user-edit"]]),
    receipt({ "/t/a": "h1" }),
  );
  assert.deepEqual(plan.actions, [{ _tag: "PreserveUserFile", target: "/t/a" }]);
});

test("preserves pre-existing files we never managed", () => {
  const plan = planInstall(new Map([["/t/a", "h1x"]]), new Map([["/t/a", "foreign"]]), receipt({}));
  assert.deepEqual(plan.actions, [{ _tag: "PreserveUserFile", target: "/t/a" }]);
});

test("removes unmodified orphans and keeps modified ones", () => {
  const actions = planOrphans(
    new Map(),
    new Map([
      ["/t/gone", "h1"],
      ["/t/edited", "user-edit"],
      ["/t/missing", undefined],
    ]),
    receipt({ "/t/gone": "h1", "/t/edited": "h1", "/t/missing": "h1" }),
  );
  assert.deepEqual(actions, [
    { _tag: "RemoveOrphan", target: "/t/gone" },
    { _tag: "PreserveUserFile", target: "/t/edited" },
  ]);
});

test("receipt keeps managed hashes and drops user files it never owned", () => {
  const desired = new Map([
    ["/t/new", "h1"],
    ["/t/user", "h2"],
  ]);
  const plan = planInstall(
    desired,
    new Map([
      ["/t/new", undefined],
      ["/t/user", "foreign"],
    ]),
    receipt({}),
  );
  const files = nextReceiptFiles(desired, plan, receipt({}));
  assert.deepEqual(files, { "/t/new": "h1" });
});

test("does not adopt pre-existing identical files it never installed", () => {
  const desired = new Map([["/t/foreign", "h1"]]);
  const plan = planInstall(desired, new Map([["/t/foreign", "h1"]]), receipt({}));
  assert.deepEqual(plan.actions, [{ _tag: "Unchanged", target: "/t/foreign" }]);
  assert.deepEqual(nextReceiptFiles(desired, plan, receipt({})), {});
});

test("keeps ownership of unchanged files it installed earlier", () => {
  const desired = new Map([["/t/ours", "h1"]]);
  const plan = planInstall(desired, new Map([["/t/ours", "h1"]]), receipt({ "/t/ours": "h1" }));
  assert.deepEqual(nextReceiptFiles(desired, plan, receipt({ "/t/ours": "h1" })), {
    "/t/ours": "h1",
  });
});
