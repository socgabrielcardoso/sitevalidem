import test from "node:test";
import assert from "node:assert/strict";
import { analyzePayload } from "../assets/js/core/detector.js";

test("multiple critical signals saturate risk without exceeding its scale", () => {
  const result = analyzePayload({ id: 219, valor: 0.05, amount: 0.05, price: 0.05, paymentStatus: "paid" });
  assert.ok(result.findings.filter(item => item.severity === "critical").length > 1);
  assert.equal(result.risk.score, 100);
  assert.equal(result.risk.label, "Crítico");
  assert.ok(result.risk.confidence <= 100);
});

test("an informational contract finding cannot erase critical payment risk", () => {
  const result = analyzePayload({ id: 410, quantity: 1, paymentStatus: "paid" });
  assert.ok(result.findings.some(item => item.ruleId === "VM100"));
  assert.ok(result.findings.some(item => item.ruleId === "VM003"));
  assert.ok(result.risk.score > 0);
  assert.notEqual(result.risk.label, "Sem sinais");
});
