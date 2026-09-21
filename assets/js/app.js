import { analyzePayload } from "./core/detector.js";
import { buildEvidenceReport, downloadJson } from "./core/evidence.js";
import { scanHar } from "./core/har.js";
import { parseJson } from "./core/normalizers.js";
import { simulateBackends } from "./core/simulator.js";
import { $, $$ } from "./ui/dom.js";
import { presetText } from "./ui/presets.js";
import { renderAnalysis, renderCatalog, renderFindings, renderHarSummary, setFindingFilter } from "./ui/render.js";

const state = { analysis: null, rawInput: null, har: null, debounce: null };
const input = $("#requestInput");
const findings = $("#findings");

function analyzeCurrent() {
  const parsed = parseJson(input.value);
  if (!parsed.ok) {
    findings.innerHTML = `<div class="empty-state">JSON inválido: ${parsed.error}</div>`;
    return;
  }
  const analysis = analyzePayload(parsed.value);
  const simulation = simulateBackends(parsed.value);
  state.analysis = analysis;
  state.rawInput = parsed.value;
  renderAnalysis(analysis, simulation);
  renderFindings(findings, analysis);
}

function usePreset(name) {
  input.value = presetText(name);
  analyzeCurrent();
}

async function handleHar(file) {
  const text = await file.text();
  const parsed = parseJson(text);
  if (!parsed.ok) throw new Error("O arquivo selecionado não contém JSON válido.");
  const result = scanHar(parsed.value);
  state.har = result;
  renderHarSummary($("#harSummary"), result);
}

renderCatalog($("#catalogList"));
usePreset("tampered");

$("#presetSafe").addEventListener("click", () => usePreset("safe"));
$("#presetTampered").addEventListener("click", () => usePreset("tampered"));
$("#presetPayment").addEventListener("click", () => usePreset("payment"));
$("#analyzeButton").addEventListener("click", analyzeCurrent);

input.addEventListener("input", () => {
  clearTimeout(state.debounce);
  state.debounce = setTimeout(analyzeCurrent, 260);
});

$("#harInput").addEventListener("change", async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  try { await handleHar(file); }
  catch (error) { $("#harSummary").textContent = error instanceof Error ? error.message : String(error); }
});

$("#downloadButton").addEventListener("click", () => {
  if (!state.analysis) return;
  downloadJson("validem-evidence.json", buildEvidenceReport(state.analysis, state.rawInput));
});

$$(".filter").forEach(button => button.addEventListener("click", () => {
  $$(".filter").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  setFindingFilter(button.dataset.filter, findings);
}));
