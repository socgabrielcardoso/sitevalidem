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

test("fractional quantities cannot receive the safe contract finding", () => {
  const result = analyzePayload({ id: 410, qty: 1.5 });
  assert.ok(result.findings.some(item => item.ruleId === "VM004"));
  assert.ok(result.findings.every(item => item.ruleId !== "VM100"));
});

test("the upper quantity limit remains a valid minimal contract", () => {
  const result = analyzePayload({ id: 219, quantity: 20 });
  assert.deepEqual(result.findings.map(item => item.ruleId), ["VM100"]);
  assert.equal(result.risk.score, 0);
});

test("one above the quantity limit is flagged", () => {
  const result = analyzePayload({ id: 219, quantity: 21 });
  assert.ok(result.findings.some(item => item.ruleId === "VM004"));
  assert.ok(result.findings.every(item => item.ruleId !== "VM100"));
});

test("invalid numeric quantities cannot bypass validation", () => {
  for (const quantity of ["many", NaN, Infinity, -Infinity]) {
    const result = analyzePayload({ id: 219, quantity });
    assert.ok(result.findings.some(item => item.ruleId === "VM004"), String(quantity));
    assert.ok(result.findings.every(item => item.ruleId !== "VM100"));
  }
});

test("an unknown identifier is recorded as an unknown catalog item", () => {
  const result = analyzePayload({ sku: "EVENT-999", quantity: 1 });
  assert.equal(result.findings.find(item => item.ruleId === "VM005").observed, "EVENT-999");
  assert.equal(result.catalogItem, null);
  assert.ok(result.findings.every(item => !["VM006", "VM100"].includes(item.ruleId)));
});

test("missing and empty identifiers cannot appear as safe contracts", () => {
  for (const payload of [{ quantity: 1 }, { id: "", quantity: 1 }]) {
    const result = analyzePayload(payload);
    assert.ok(result.findings.some(item => item.ruleId === "VM006"));
    assert.ok(result.findings.every(item => item.ruleId !== "VM100"));
  }
});

test("case-insensitive SKUs and numeric quantity strings stay valid", () => {
  const result = analyzePayload({ sku: "  event-410  ", quantity: "2" });
  assert.equal(result.catalogItem.id, 410);
  assert.equal(result.quantity, 2);
  assert.deepEqual(result.findings.map(item => item.ruleId), ["VM100"]);
  assert.equal(result.risk.score, 0);
});

test("both true and false payment flags cross the trust boundary", () => {
  for (const paid of [true, false]) {
    const result = analyzePayload({ id: 410, quantity: 1, paid });
    const finding = result.findings.find(item => item.ruleId === "VM003");
    assert.ok(finding);
    assert.equal(finding.observed, paid);
    assert.equal(finding.severity, "critical");
  }
});

test("nested payment status preserves its path even when pending", () => {
  const result = analyzePayload({ id: 410, checkout: { payment_status: "pending" } });
  const finding = result.findings.find(item => item.ruleId === "VM003");
  assert.ok(finding);
  assert.equal(finding.path, "checkout.payment_status");
  assert.equal(finding.observed, "pending");
});

test("spaced and hyphenated money keys still expose tampering", () => {
  const result = analyzePayload({ id: 219, " Unit-Price ": 0.05 });
  const finding = result.findings.find(item => item.ruleId === "VM002");
  assert.ok(finding);
  assert.equal(finding.path, " Unit-Price ");
  assert.equal(finding.expected, 79.9);
});

test("non-price monetary fields remain untrusted checkout inputs", () => {
  const result = analyzePayload({ id: 219, discount: 5, tax: 12, shipping: 10 });
  assert.deepEqual(result.findings.filter(item => item.ruleId === "VM001").map(item => item.path).sort(),
    ["discount", "shipping", "tax"]);
  assert.ok(result.findings.every(item => item.ruleId !== "VM100"));
});
