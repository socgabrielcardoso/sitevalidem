import { analyzePayload } from "./detector.js";
import { parseJson } from "./normalizers.js";

function queryToObject(query = []) {
  const output = {};
  for (const pair of query) {
    if (!pair?.name) continue;
    if (output[pair.name] === undefined) output[pair.name] = pair.value;
    else if (Array.isArray(output[pair.name])) output[pair.name].push(pair.value);
    else output[pair.name] = [output[pair.name], pair.value];
  }
  return output;
}

function postDataToObject(postData) {
  if (!postData) return null;
  if (Array.isArray(postData.params) && postData.params.length) {
    return queryToObject(postData.params);
  }
  if (typeof postData.text === "string" && postData.text.trim()) {
    const parsed = parseJson(postData.text);
    if (parsed.ok) return parsed.value;
    try { return Object.fromEntries(new URLSearchParams(postData.text)); }
    catch { return null; }
  }
  return null;
}

export function scanHar(har) {
  const entries = har?.log?.entries;
  if (!Array.isArray(entries)) throw new Error("Formato HAR inválido: log.entries não encontrado.");

  const requests = [];
  for (const entry of entries) {
    const request = entry?.request ?? {};
    const candidates = [];
    const body = postDataToObject(request.postData);
    const query = queryToObject(request.queryString);
    if (body && Object.keys(body).length) candidates.push({ location: "body", payload: body });
    if (Object.keys(query).length) candidates.push({ location: "query", payload: query });

    for (const candidate of candidates) {
      const analysis = analyzePayload(candidate.payload, { source: "har" });
      const harmful = analysis.findings.filter(item => item.severity !== "low");
      if (harmful.length) {
        requests.push({
          method: request.method ?? "GET",
          url: request.url ?? "",
          location: candidate.location,
          payload: candidate.payload,
          analysis
        });
      }
    }
  }

  const critical = requests.reduce((sum, item) => sum + item.analysis.findings.filter(f => f.severity === "critical").length, 0);
  const high = requests.reduce((sum, item) => sum + item.analysis.findings.filter(f => f.severity === "high").length, 0);
  return { totalEntries: entries.length, suspiciousRequests: requests.length, critical, high, requests };
}
