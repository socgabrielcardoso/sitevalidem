import { findCatalogItem, money } from "./catalog.js";
import { asFiniteNumber, firstIdentifier, flattenObject, quantityFrom } from "./normalizers.js";
import { MONEY_KEYS } from "./rules.js";

export function simulateBackends(payload) {
  const flat = flattenObject(payload);
  const identifier = firstIdentifier(flat);
  const item = findCatalogItem(identifier);
  const quantity = quantityFrom(flat);
  const clientMoneyField = flat.find(field => MONEY_KEYS.has(field.canonical) && asFiniteNumber(field.value) !== null);
  const clientValue = clientMoneyField ? asFiniteNumber(clientMoneyField.value) : null;
  const qty = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;

  const vulnerableTotal = clientValue ?? (item ? item.price * qty : null);
  const protectedTotal = item ? item.price * qty : null;

  return {
    vulnerable: {
      accepted: vulnerableTotal !== null,
      total: vulnerableTotal,
      display: vulnerableTotal === null ? "indeterminado" : money(vulnerableTotal),
      explanation: clientValue !== null ? "Usou valor enviado pelo navegador." : "Sem campo monetário recebido."
    },
    protected: {
      accepted: Boolean(item),
      total: protectedTotal,
      display: protectedTotal === null ? "rejeitado" : money(protectedTotal),
      explanation: item ? "Recalculou com catálogo do servidor." : "Rejeitou item inexistente."
    }
  };
}
