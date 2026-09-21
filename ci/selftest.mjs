import { analyzePayload } from "../assets/js/core/detector.js";
import { scanHar } from "../assets/js/core/har.js";
import { simulateBackends } from "../assets/js/core/simulator.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const tampered = analyzePayload({ id: 219, quantity: 1, valor: 0.05 });
assert(tampered.findings.some(item => item.ruleId === "VM002"), "price mismatch was not detected");
assert(tampered.findings.some(item => item.ruleId === "VM007"), "tiny amount was not detected");

const safe = analyzePayload({ id: 219, quantity: 1 });
assert(safe.findings.every(item => item.severity === "low"), "safe shape produced a harmful finding");

const payment = analyzePayload({ id: 410, quantity: 1, paymentStatus: "paid" });
assert(payment.findings.some(item => item.ruleId === "VM003"), "client payment status was not detected");

const simulation = simulateBackends({ id: 219, quantity: 1, valor: 0.05 });
assert(simulation.vulnerable.total === 0.05, "vulnerable simulation failed");
assert(simulation.protected.total === 79.9, "protected simulation failed");

const har = { log: { entries: [{ request: { method: "POST", url: "https://demo.local/checkout", queryString: [], postData: { text: JSON.stringify({ id: 219, valor: 0.05 }) } } }] } };
const harResult = scanHar(har);
assert(harResult.suspiciousRequests === 1, "HAR scanner did not find suspicious request");

console.log("ValideM core self test passed");
