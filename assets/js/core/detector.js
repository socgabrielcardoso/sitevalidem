import { findCatalogItem } from "./catalog.js";
import { asFiniteNumber, firstIdentifier, flattenObject, quantityFrom } from "./normalizers.js";
import { MONEY_KEYS, PAYMENT_STATE_KEYS, QUANTITY_KEYS, rules } from "./rules.js";
import { calculateRisk } from "./scoring.js";

function finding(rule, details = {}) {
  return {
    ruleId: rule.id,
    severity: rule.severity,
    title: rule.title,
    guidance: rule.guidance,
    path: details.path ?? "$",
    observed: details.observed ?? null,
    expected: details.expected ?? null,
    reason: details.reason ?? ""
  };
}

function monetaryFields(flat) {
  return flat.filter(field => MONEY_KEYS.has(field.canonical));
}

export function analyzePayload(payload, options = {}) {
  const flat = flattenObject(payload);
  const findings = [];
  const identifier = firstIdentifier(flat);
  const item = findCatalogItem(identifier);
  const quantity = quantityFrom(flat);
  const moneyFields = monetaryFields(flat);

  if (identifier === null || identifier === "") {
    findings.push(finding(rules.missingIdentifier, { reason: "Não foi possível vincular a requisição a um item do catálogo." }));
  } else if (!item || !item.active) {
    findings.push(finding(rules.unknownItem, { observed: identifier, reason: "O identificador não corresponde a um item ativo da fonte confiável." }));
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    const qtyField = flat.find(field => QUANTITY_KEYS.has(field.canonical));
    findings.push(finding(rules.invalidQuantity, {
      path: qtyField?.path ?? "quantity",
      observed: qtyField?.value ?? quantity,
      expected: "inteiro entre 1 e 20",
      reason: "A quantidade deve ser validada novamente no backend."
    }));
  }

  for (const field of moneyFields) {
    const numeric = asFiniteNumber(field.value);
    findings.push(finding(rules.clientMoney, {
      path: field.path,
      observed: field.value,
      reason: "Preço, total, desconto, taxa ou frete não devem ser fonte de verdade no cliente."
    }));
    if (numeric !== null && numeric >= 0 && numeric < 0.1) {
      findings.push(finding(rules.suspiciousTinyAmount, {
        path: field.path,
        observed: numeric,
        reason: "O padrão é compatível com adulteração de valor como a demonstrada no vídeo."
      }));
    }
    if (item && numeric !== null && ["price", "valor", "amount", "unit_price", "unitprice", "preco", "preço"].includes(field.canonical)) {
      const expected = Number((item.price * (Number.isFinite(quantity) ? quantity : 1)).toFixed(2));
      const unitExpected = item.price;
      const allowed = Math.abs(numeric - unitExpected) < 0.005 || Math.abs(numeric - expected) < 0.005;
      if (!allowed) {
        findings.push(finding(rules.priceMismatch, {
          path: field.path,
          observed: numeric,
          expected: unitExpected,
          reason: `O catálogo autoritativo informa ${unitExpected.toFixed(2)} por unidade.`
        }));
      }
    }
  }

  for (const field of flat.filter(field => PAYMENT_STATE_KEYS.has(field.canonical))) {
    findings.push(finding(rules.clientPaymentState, {
      path: field.path,
      observed: field.value,
      reason: "O navegador não deve poder declarar que uma cobrança foi paga, aprovada ou confirmada."
    }));
  }

  if (item && moneyFields.length === 0 && Number.isInteger(quantity) && quantity >= 1 && quantity <= 20) {
    findings.push(finding(rules.safeRecalculation, {
      path: "$",
      expected: { itemId: item.id, quantity },
      reason: "A forma da requisição permite que o servidor derive o valor sem confiar em preço vindo do cliente."
    }));
  }

  const risk = calculateRisk(findings);
  return {
    generatedAt: new Date().toISOString(),
    source: options.source ?? "manual",
    identifier,
    quantity,
    catalogItem: item,
    findings,
    risk
  };
}
