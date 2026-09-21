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

test("zero and sub-ten-cent amounts are flagged at the boundary", () => {
  for (const [valor, expected] of [[0, true], [0.099, true], [0.1, false]]) {
    const result = analyzePayload({ id: 219, quantity: 1, valor });
    assert.equal(result.findings.some(item => item.ruleId === "VM007"), expected, `valor=${valor}`);
    assert.ok(result.findings.some(item => item.ruleId === "VM002"));
  }
});

test("a matching client price is untrusted without a false mismatch", () => {
  const result = analyzePayload({ id: 219, quantity: 1, price: 79.9 });
  assert.ok(result.findings.some(item => item.ruleId === "VM001"));
  assert.ok(result.findings.every(item => item.ruleId !== "VM002"));
  assert.ok(result.findings.every(item => item.ruleId !== "VM100"));
  assert.ok(result.risk.score > 0);
});

test("decimal comma input retains its evidence and triggers tampering rules", () => {
  const result = analyzePayload({ id: 219, valor: "0,05" });
  assert.equal(result.findings.find(item => item.ruleId === "VM001").observed, "0,05");
  assert.equal(result.findings.find(item => item.ruleId === "VM002").observed, 0.05);
  assert.ok(result.findings.some(item => item.ruleId === "VM007"));
});

test("zero quantity is not a safe checkout contract", () => {
  const result = analyzePayload({ id: 219, quantity: 0 });
  assert.equal(result.findings.find(item => item.ruleId === "VM004").observed, 0);
  assert.ok(result.findings.every(item => item.ruleId !== "VM100"));
});

test("negative quantities retain the offending nested field", () => {
  const result = analyzePayload({ order: { id: 219, quantidade: -1 } });
  const finding = result.findings.find(item => item.ruleId === "VM004");
  assert.ok(finding);
  assert.equal(finding.path, "order.quantidade");
  assert.equal(finding.observed, -1);
});
