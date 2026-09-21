import test from "node:test";
import assert from "node:assert/strict";
import { analyzePayload } from "../assets/js/core/detector.js";

test("nested tampering keeps the field path and authoritative price", () => {
  const result = analyzePayload({ order: { id: 219, quantity: 1, item: { valor: 0.05 } } });
  const mismatch = result.findings.find(item => item.ruleId === "VM002");
  assert.ok(mismatch, "nested price tampering must be detected");
  assert.equal(mismatch.path, "order.item.valor");
  assert.equal(mismatch.observed, 0.05);
  assert.equal(mismatch.expected, 79.9);
  assert.equal(mismatch.severity, "critical");
});
