import { analyzePayload } from "../assets/js/core/detector.js";
import { scanHar } from "../assets/js/core/har.js";
import { simulateBackends } from "../assets/js/core/simulator.js";

const results = document.querySelector("#results");
let failures = 0;

function test(name, fn) {
  const item = document.createElement("li");
  try {
    fn();
    item.className = "pass";
    item.textContent = `PASS ${name}`;
  } catch (error) {
    failures += 1;
    item.className = "fail";
    item.textContent = `FAIL ${name}: ${error.message}`;
  }
  results.appendChild(item);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

test("detecta valor adulterado", () => {
  const result = analyzePayload({ id: 219, quantity: 1, valor: 0.05 });
  assert(result.findings.some(item => item.ruleId === "VM002"), "VM002 ausente");
  assert(result.findings.some(item => item.ruleId === "VM007"), "VM007 ausente");
});

test("aceita formato sem preço no cliente", () => {
  const result = analyzePayload({ id: 219, quantity: 1 });
  assert(result.findings.every(item => item.severity === "low"), "houve achado de risco inesperado");
});

test("detecta estado de pagamento vindo do cliente", () => {
  const result = analyzePayload({ id: 410, quantity: 1, paymentStatus: "paid" });
  assert(result.findings.some(item => item.ruleId === "VM003"), "VM003 ausente");
});

test("backend protegido ignora preço recebido", () => {
  const sim = simulateBackends({ id: 219, quantity: 1, valor: 0.05 });
  assert(sim.vulnerable.total === 0.05, "simulação vulnerável incorreta");
  assert(sim.protected.total === 79.9, "simulação protegida incorreta");
});

test("scanner HAR encontra body suspeito", () => {
  const har = { log: { entries: [{ request: { method: "POST", url: "https://demo.local/checkout", queryString: [], postData: { text: JSON.stringify({ id: 219, valor: 0.05 }) } } }] } };
  const result = scanHar(har);
  assert(result.suspiciousRequests === 1, "requisição não detectada");
});

const summary = document.createElement("p");
summary.innerHTML = failures ? `<strong class="fail">${failures} teste(s) falharam.</strong>` : `<strong class="pass">Todos os testes passaram.</strong>`;
results.after(summary);
