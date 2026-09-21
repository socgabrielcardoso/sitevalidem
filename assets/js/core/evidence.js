export function buildEvidenceReport(analysis, input) {
  return {
    tool: "ValideM Price Integrity Sentinel",
    version: 1,
    generatedAt: new Date().toISOString(),
    scope: "Defensive request analysis",
    analysis,
    input,
    interpretation: {
      provesBackendExploitability: false,
      note: "Achados em payload ou HAR indicam exposição a adulteração. A confirmação de vulnerabilidade exige teste autorizado do comportamento real do backend."
    }
  };
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
