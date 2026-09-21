export const catalog = Object.freeze([
  Object.freeze({ id: 219, sku: "EVENT-219", name: "Ingresso Demo 219", price: 79.90, currency: "BRL", active: true }),
  Object.freeze({ id: 410, sku: "EVENT-410", name: "Ingresso Demo 410", price: 129.90, currency: "BRL", active: true }),
  Object.freeze({ id: 735, sku: "EVENT-735", name: "Ingresso Demo 735", price: 49.50, currency: "BRL", active: true })
]);

export function findCatalogItem(identifier) {
  const normalized = String(identifier ?? "").trim().toLowerCase();
  return catalog.find(item => String(item.id) === normalized || item.sku.toLowerCase() === normalized) ?? null;
}

export function money(value, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(Number(value) || 0);
}
