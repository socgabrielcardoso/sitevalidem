export const presets = Object.freeze({
  safe: {
    id: 219,
    quantity: 1
  },
  tampered: {
    id: 219,
    eventoKey: "64_86_000002",
    quantity: 1,
    valor: 0.05
  },
  payment: {
    eventId: 410,
    quantity: 2,
    amount: 0.05,
    paymentStatus: "paid"
  }
});

export function presetText(name) {
  return JSON.stringify(presets[name], null, 2);
}
