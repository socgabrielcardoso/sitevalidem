const ID_KEYS = new Set(["id", "productid", "product_id", "eventid", "event_id", "sku", "eventokey", "eventkey"]);
const QTY_KEYS = new Set(["qty", "quantity", "quantidade"]);

export function canonicalKey(key) {
  return String(key ?? "").trim().toLowerCase().replace(/[\s.-]+/g, "_");
}

export function flattenObject(value, prefix = "", output = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flattenObject(item, `${prefix}[${index}]`, output));
    return output;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (child && typeof child === "object") flattenObject(child, path, output);
      else output.push({ path, key, canonical: canonicalKey(key), value: child });
    });
    return output;
  }
  output.push({ path: prefix || "$", key: prefix || "$", canonical: canonicalKey(prefix), value });
  return output;
}

export function parseJson(text) {
  try { return { ok: true, value: JSON.parse(text), error: null }; }
  catch (error) { return { ok: false, value: null, error: error instanceof Error ? error.message : String(error) }; }
}

export function firstIdentifier(flat) {
  return flat.find(field => ID_KEYS.has(field.canonical))?.value ?? null;
}

export function quantityFrom(flat) {
  const raw = flat.find(field => QTY_KEYS.has(field.canonical))?.value ?? 1;
  const quantity = Number(raw);
  return Number.isFinite(quantity) ? quantity : NaN;
}

export function asFiniteNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;
  const candidate = Number(value.replace(",", "."));
  return Number.isFinite(candidate) ? candidate : null;
}
