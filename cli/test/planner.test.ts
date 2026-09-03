import { assert, it } from "@effect/vitest";
import type {
  AgentComponentReceipt,
  DesiredComponent,
  DesiredFileNode,
  DiskEntry,
  NodeSnapshot,
  ReceiptV2,
  RootPaths,
} from "../src/domain.js";
import { fingerprintDisk } from "../src/filesystem.js";
import { planComponents, snapshotIdentity } from "../src/planner.js";

const roots: RootPaths = {
  "canonical-skills": "/home/u/.agents/skills",
  "claude-skills": "/home/u/.claude/skills",
  "kiro-skills": "/home/u/.kiro/skills",
  "claude-agents": "/home/u/.claude/agents",
  "opencode-agents": "/home/u/.config/opencode/agents",
  "codex-agents": "/home/u/.codex/agents",
  "codex-profiles": "/home/u/.codex",
  state: "/home/u/.config/skill-it",
};

const node = (hash: string): DesiredFileNode => ({
  kind: "file",
  root: "claude-agents",
  relativePath: "review-it.md",
  content: new Uint8Array(),
  hash,
  actualMode: "copy",
});

const component = (hash: string): DesiredComponent => ({
  key: "agent:review-it",
  kind: "agent",
  name: "review-it",
  consumers: ["claude-code"],
  nodes: [node(hash)],
});

const receiptComponent = (hash: string): AgentComponentReceipt => ({
  key: "agent:review-it",
  kind: "agent",
  name: "review-it",
  consumers: ["claude-code"],
  artifacts: [
    {
      kind: "file",
      root: "claude-agents",
      relativePath: "review-it.md",
      installedHash: hash,
      actualMode: "copy",
    },
  ],
});

const snapshots = (desired: DesiredFileNode, disk: DiskEntry): ReadonlyMap<string, NodeSnapshot> =>
  new Map([
    [snapshotIdentity(desired), { node: desired, disk, fingerprint: fingerprintDisk(disk) }],
  ]);

const nextReceipt: ReceiptV2 = {
  schemaVersion: 2,
  packageVersion: "2.0.0",
  components: [receiptComponent("new")],
};

it("creates a missing component", () => {
  const desired = component("new");
  const plan = planComponents({
    desired: [desired],
    previous: [],
    snapshots: snapshots(node("new"), { kind: "missing" }),
    roots,
    force: false,
    allowAdoption: true,
    nextReceipt,
  });
  assert.equal(plan.conflicts.length, 0);
  assert.equal(plan.actions[0]?.kind, "Create");
});

it("adopts exact content only during explicit install", () => {
  const desired = component("same");
  const disk: DiskEntry = { kind: "file", hash: "same" };
  const install = planComponents({
    desired: [desired],
    previous: [],
    snapshots: snapshots(node("same"), disk),
    roots,
    force: false,
    allowAdoption: true,
  });
  const update = planComponents({
    desired: [desired],
    previous: [],
    snapshots: snapshots(node("same"), disk),
    roots,
    force: false,
    allowAdoption: false,
  });
  assert.equal(install.actions[0]?.kind, "Adopt");
  assert.equal(update.conflicts.length, 1);
});

it("updates content that still matches its recorded old hash", () => {
  const desired = component("new");
  const plan = planComponents({
    desired: [desired],
    previous: [receiptComponent("old")],
    snapshots: snapshots(node("new"), { kind: "file", hash: "old" }),
    roots,
    force: false,
    allowAdoption: false,
  });
  assert.equal(plan.conflicts.length, 0);
  assert.equal(plan.actions[0]?.kind, "Replace");
});

it("fails the complete preflight on modified content unless forced", () => {
  const desired = component("new");
  const disk: DiskEntry = { kind: "file", hash: "user-edit" };
  const safe = planComponents({
    desired: [desired],
    previous: [receiptComponent("old")],
    snapshots: snapshots(node("new"), disk),
    roots,
    force: false,
    allowAdoption: false,
  });
  const forced = planComponents({
    desired: [desired],
    previous: [receiptComponent("old")],
    snapshots: snapshots(node("new"), disk),
    roots,
    force: true,
    allowAdoption: false,
  });
  assert.equal(safe.actions.length, 0);
  assert.equal(safe.conflicts.length, 1);
  assert.equal(forced.actions[0]?.kind, "Replace");
});

it("removes only obsolete content that still matches the receipt", () => {
  const old = receiptComponent("old");
  const oldNode = node("old");
  const plan = planComponents({
    desired: [],
    previous: [old],
    snapshots: snapshots(oldNode, { kind: "file", hash: "old" }),
    roots,
    force: false,
    allowAdoption: false,
  });
  assert.equal(plan.actions[0]?.kind, "Remove");
});
