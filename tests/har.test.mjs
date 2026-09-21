import test from "node:test";
import assert from "node:assert/strict";
import { scanHar } from "../assets/js/core/har.js";

function scanRequest(request) {
  return scanHar({ log: { entries: [{ request: {
    method: "POST", url: "https://example.test/checkout", queryString: [], ...request
  } }] } });
}

test("HAR JSON body findings keep request metadata and evidence", () => {
  const result = scanRequest({ postData: { text: JSON.stringify({ id: 735, valor: 0.05 }) } });
  assert.equal(result.totalEntries, 1);
  assert.equal(result.suspiciousRequests, 1);
  const request = result.requests[0];
  assert.equal(request.location, "body");
  assert.equal(request.method, "POST");
  assert.equal(request.url, "https://example.test/checkout");
  assert.equal(request.analysis.source, "har");
  assert.equal(request.analysis.findings.find(item => item.ruleId === "VM002").expected, 49.5);
});
