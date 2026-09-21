import test from "node:test";
import assert from "node:assert/strict";
import { simulateBackends } from "../assets/js/core/simulator.js";

test("the protected simulation recalculates a nested multi-ticket order", () => {
  const result = simulateBackends({ order: { id: 410, quantity: 2, amount: 0.01 } });
  assert.equal(result.vulnerable.total, 0.01);
  assert.equal(result.protected.accepted, true);
  assert.equal(result.protected.total, 259.8);
});
