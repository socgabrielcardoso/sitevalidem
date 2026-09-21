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

test("HAR query parameters expose price tampering", () => {
  const result = scanRequest({ method: "GET", queryString: [
    { name: "id", value: "410" }, { name: "valor", value: "0.05" }
  ] });
  assert.equal(result.suspiciousRequests, 1);
  assert.equal(result.requests[0].location, "query");
  assert.ok(result.requests[0].analysis.findings.some(item => item.ruleId === "VM002"));
});

test("HAR form parameters retain client-controlled payment state", () => {
  const result = scanRequest({ postData: { params: [
    { name: "id", value: "219" }, { name: "paymentStatus", value: "paid" }
  ] } });
  assert.equal(result.suspiciousRequests, 1);
  assert.equal(result.requests[0].location, "body");
  assert.equal(result.requests[0].analysis.findings.find(item => item.ruleId === "VM003").observed, "paid");
});

test("URL-encoded body values are decoded before price analysis", () => {
  const result = scanRequest({ postData: {
    mimeType: "application/x-www-form-urlencoded", text: "id=219&quantity=1&valor=0%2C05"
  } });
  assert.equal(result.suspiciousRequests, 1);
  assert.equal(result.requests[0].payload.valor, "0,05");
  assert.ok(result.requests[0].analysis.findings.some(item => item.ruleId === "VM002"));
});
