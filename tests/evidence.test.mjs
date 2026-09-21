import test from "node:test";
import assert from "node:assert/strict";
import { analyzePayload } from "../assets/js/core/detector.js";
import { buildEvidenceReport } from "../assets/js/core/evidence.js";

test("an exported finding preserves evidence without claiming a proven backend exploit", () => {
  const input = { id: 219, valor: 0.05 };
  const analysis = analyzePayload(input);
  const report = buildEvidenceReport(analysis, input);
  const exported = JSON.parse(JSON.stringify(report));
  assert.deepEqual(exported.input, input);
  assert.deepEqual(exported.analysis, analysis);
  assert.equal(exported.interpretation.provesBackendExploitability, false);
  assert.ok(exported.interpretation.note.length > 0);
  assert.ok(Number.isFinite(Date.parse(exported.generatedAt)));
});
