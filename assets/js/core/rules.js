export const MONEY_KEYS = new Set([
  "price", "valor", "amount", "total", "subtotal", "unit_price", "unitprice", "preco", "preço",
  "discount", "desconto", "tax", "imposto", "shipping", "frete", "fee", "tarifa"
]);

export const PAYMENT_STATE_KEYS = new Set([
  "paid", "ispaid", "payment_status", "paymentstatus", "status_pagamento", "pagamento_confirmado",
  "approved", "confirmed", "pix_status", "pixstatus"
]);

export const QUANTITY_KEYS = new Set(["qty", "quantity", "quantidade"]);

export const rules = Object.freeze({
  clientMoney: {
    id: "VM001",
    severity: "high",
    title: "Campo monetário controlado pelo cliente",
    guidance: "Remova o valor do contrato de entrada e recalcule no servidor a partir de um identificador confiável."
  },
  priceMismatch: {
    id: "VM002",
    severity: "critical",
    title: "Divergência entre valor enviado e catálogo",
    guidance: "Ignore o valor recebido, recalcule o pedido e registre a tentativa de adulteração."
  },
  clientPaymentState: {
    id: "VM003",
    severity: "critical",
    title: "Estado de pagamento vindo do cliente",
    guidance: "Confirme pagamento por integração autenticada, webhook verificado e reconciliação server to server."
  },
  invalidQuantity: {
    id: "VM004",
    severity: "high",
    title: "Quantidade fora da regra",
    guidance: "Valide tipo, faixa e limite comercial no backend."
  },
  unknownItem: {
    id: "VM005",
    severity: "high",
    title: "Identificador inexistente no catálogo",
    guidance: "Falhe de forma fechada quando o item não existir ou estiver inativo."
  },
  missingIdentifier: {
    id: "VM006",
    severity: "medium",
    title: "Requisição sem identificador confiável",
    guidance: "Defina um contrato explícito com identificador do item e quantidade."
  },
  suspiciousTinyAmount: {
    id: "VM007",
    severity: "high",
    title: "Valor monetário anormalmente baixo",
    guidance: "Use validação de integridade e compare com o valor derivado no servidor."
  },
  safeRecalculation: {
    id: "VM100",
    severity: "low",
    title: "Contrato compatível com recálculo no backend",
    guidance: "Mantenha a fonte de verdade no servidor e valide novamente na criação e confirmação do pagamento."
  }
});
