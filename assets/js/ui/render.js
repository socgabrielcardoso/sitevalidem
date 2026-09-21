import { catalog, money } from "../core/catalog.js";
import { countsBySeverity } from "../core/scoring.js";
import { escapeHtml, setText } from "./dom.js";

let lastAnalysis = null;
let activeFilter = "all";

export function renderCatalog(container) {
  container.innerHTML = catalog.map(item => `
    <div class="catalog-item">
      <div><strong>${escapeHtml(item.name)}</strong><span>ID ${item.id} | ${escapeHtml(item.sku)}</span></div>
      <strong>${money(item.price)}</strong>
    </div>`).join("");
}

function filteredFindings(analysis) {
  if (!analysis) return [];
  if (activeFilter === "all") return analysis.findings;
  return analysis.findings.filter(item => item.severity === activeFilter);
}

export function renderFindings(container, analysis) {
  lastAnalysis = analysis;
  const findings = filteredFindings(analysis);
  if (!findings.length) {
    container.innerHTML = `<div class="empty-state">Nenhum achado para o filtro atual.</div>`;
    return;
  }
  container.innerHTML = findings.map(item => `
    <article class="finding" data-severity="${escapeHtml(item.severity)}">
      <span class="severity ${escapeHtml(item.severity)}">${escapeHtml(item.severity)}</span>
      <div>
        <h3>${escapeHtml(item.ruleId)} | ${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.reason || item.guidance)}</p>
      </div>
      <code>${escapeHtml(item.path)}</code>
    </article>`).join("");
}

export function setFindingFilter(filter, container) {
  activeFilter = filter;
  renderFindings(container, lastAnalysis);
}

export function renderAnalysis(analysis, simulation) {
  const harmful = analysis.findings.filter(item => item.severity !== "low");
  const counts = countsBySeverity(analysis.findings);
  const unsafe = harmful.length > 0;

  setText("#riskScore", analysis.risk.score);
  setText("#riskLabel", analysis.risk.label);
  setText("#findingCount", analysis.findings.length);
  setText("#criticalCount", counts.critical);
  setText("#confidenceValue", `${analysis.risk.confidence}%`);
  setText("#verdictTitle", unsafe ? "Integridade do pedido em risco" : "Formato compatível com defesa no backend");
  setText("#verdictSummary", unsafe
    ? "A requisição contém sinais que não deveriam ser tratados como fonte de verdade pelo servidor."
    : "Nenhum campo monetário ou estado de pagamento controlado pelo cliente foi encontrado neste payload.");

  const badge = document.querySelector("#verdictBadge");
  badge.textContent = unsafe ? "Review" : "Pass";
  badge.className = `badge ${unsafe ? "danger" : "safe"}`;

  document.querySelector("#simulationResult").innerHTML = `
    <div class="sim-card vulnerable">
      <h3>Backend que confia no cliente</h3>
      <strong>${escapeHtml(simulation.vulnerable.display)}</strong>
      <code>${escapeHtml(simulation.vulnerable.explanation)}</code>
    </div>
    <div class="sim-card protected">
      <h3>Backend que recalcula</h3>
      <strong>${escapeHtml(simulation.protected.display)}</strong>
      <code>${escapeHtml(simulation.protected.explanation)}</code>
    </div>`;
}

export function renderHarSummary(container, result) {
  container.classList.remove("empty");
  container.innerHTML = `
    <div class="har-stat-grid">
      <div><span>Entradas</span><strong>${result.totalEntries}</strong></div>
      <div><span>Requisições suspeitas</span><strong>${result.suspiciousRequests}</strong></div>
      <div><span>Críticas</span><strong>${result.critical}</strong></div>
    </div>
    <p class="muted">Foram encontradas ${result.high} detecções de severidade alta.</p>`;
}
