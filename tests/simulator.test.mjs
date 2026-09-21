import test from "node:test";
import assert from "node:assert/strict";
import { simulateBackends } from "../assets/js/core/simulator.js";

test("the protected simulation recalculates a nested multi-ticket order", () => {
  const result = simulateBackends({ order: { id: 410, quantity: 2, amount: 0.01 } });
  assert.equal(result.vulnerable.total, 0.01);
  assert.equal(result.protected.accepted, true);
  assert.equal(result.protected.total, 259.8);
});

test("a client price cannot make an unknown item valid in the protected simulation", () => {
  const result = simulateBackends({ id: 999, quantity: 1, price: 0.05 });
  assert.equal(result.vulnerable.accepted, true);
  assert.equal(result.protected.accepted, false);
  assert.equal(result.protected.total, null);
});

test("valid quantities use the catalog total when no client price is supplied", () => {
  const result = simulateBackends({ id: 735, quantity: 3 });
  assert.equal(result.protected.accepted, true);
  assert.equal(result.protected.total, 148.5);
  assert.equal(result.vulnerable.total, 148.5);
});
