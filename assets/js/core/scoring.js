const weights = Object.freeze({ critical: 34, high: 21, medium: 11, low: 0 });

export function calculateRisk(findings) {
  if (!Array.isArray(findings) || findings.length === 0) {
    return { score: 0, label: "Sem sinais", confidence: 70 };
  }
  const harmful = findings.filter(item => item.severity !== "low");
  const raw = harmful.reduce((sum, item) => sum + (weights[item.severity] ?? 5), 0);
  const score = Math.min(100, raw);
  const label = score >= 80 ? "Crítico" : score >= 55 ? "Alto" : score >= 25 ? "Moderado" : score > 0 ? "Baixo" : "Sem sinais";
  const diversity = new Set(harmful.map(item => item.ruleId)).size;
  const confidence = Math.min(98, 72 + diversity * 5);
  return { score, label, confidence };
}

export function countsBySeverity(findings) {
  return findings.reduce((acc, item) => {
    acc[item.severity] = (acc[item.severity] ?? 0) + 1;
    return acc;
  }, { critical: 0, high: 0, medium: 0, low: 0 });
}
