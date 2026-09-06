import { assert, it } from "@effect/vitest";
import { parseReceipt } from "../src/receipt.js";

const hash = "a".repeat(64);

type ArtifactFixture = {
  kind: string;
  root: string;
  relativePath: string;
  installedHash: string;
  actualMode: string;
};

type ComponentFixture = {
  key: string;
  kind: string;
  name: string;
  consumers: Array<string>;
  requestedMode: string;
  artifacts: [ArtifactFixture];
};

type ReceiptFixture = {
  schemaVersion: number;
  packageVersion: string;
  components: [ComponentFixture];
};

const validReceipt = (): ReceiptFixture => ({
  schemaVersion: 2,
  packageVersion: "1.0.0",
  components: [
    {
      key: "skill:review-it",
      kind: "skill",
      name: "review-it",
      consumers: ["codex"],
      requestedMode: "symlink",
      artifacts: [
        {
          kind: "file",
          root: "canonical-skills",
          relativePath: "review-it/SKILL.md",
          installedHash: hash,
          actualMode: "canonical",
        },
      ],
    },
  ],
});

it("accepts a root-relative Receipt v2", () => {
  assert.equal(parseReceipt(JSON.stringify(validReceipt())).kind, "valid");
});

it("recognizes the prototype receipt without trusting its absolute paths", () => {
  const state = parseReceipt(
    JSON.stringify({ packageVersion: "0.0.0", harnesses: ["codex"], files: { "/tmp/x": hash } }),
  );
  assert.equal(state.kind, "legacy");
});

it("rejects traversal and arbitrary component paths", () => {
  const traversal = validReceipt();
  traversal.components[0].artifacts[0].relativePath = "../outside";
  const unrelated = validReceipt();
  unrelated.components[0].artifacts[0].relativePath = "another-skill/SKILL.md";
  assert.equal(parseReceipt(JSON.stringify(traversal)).kind, "invalid");
  assert.equal(parseReceipt(JSON.stringify(unrelated)).kind, "invalid");
});

it("rejects duplicate components, unknown roots, and malformed hashes", () => {
  const duplicate = validReceipt();
  duplicate.components.push(structuredClone(duplicate.components[0]));
  const unknownRoot = validReceipt();
  unknownRoot.components[0].artifacts[0].root = "home";
  const malformedHash = validReceipt();
  malformedHash.components[0].artifacts[0].installedHash = "short";
  assert.equal(parseReceipt(JSON.stringify(duplicate)).kind, "invalid");
  assert.equal(parseReceipt(JSON.stringify(unknownRoot)).kind, "invalid");
  assert.equal(parseReceipt(JSON.stringify(malformedHash)).kind, "invalid");
});

it("rejects artifacts that do not belong to their recorded consumers or mode", () => {
  const wrongConsumer = validReceipt();
  wrongConsumer.components[0].consumers = ["claude-code"];
  wrongConsumer.components[0].artifacts[0].root = "kiro-skills";
  wrongConsumer.components[0].artifacts[0].actualMode = "copy";
  const wrongMode = validReceipt();
  wrongMode.components[0].consumers = ["claude-code"];
  wrongMode.components[0].artifacts[0].root = "claude-skills";
  wrongMode.components[0].artifacts[0].actualMode = "copy";
  assert.equal(parseReceipt(JSON.stringify(wrongConsumer)).kind, "invalid");
  assert.equal(parseReceipt(JSON.stringify(wrongMode)).kind, "invalid");
});
