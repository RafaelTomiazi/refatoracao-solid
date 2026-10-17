// Escolhe a forma de pagamento pelo nome que vem no pedido.
// As formas aceitas vem de fora (no index), entao pra aceitar uma nova
// e so registrar ela la, sem criar mais um else if aqui.
class PaymentProcessor {
  constructor(methods) {
    this.methods = methods; // { pix: new PixPayment(), credit_card: ..., boleto: ... }
  }

  process(order, subtotal) {
    const method = this.methods[order.paymentMethod];

    if (!method) {
      throw new Error("Forma de pagamento invalida.");
    }

    return method.process(order, subtotal);
  }
}

module.exports = PaymentProcessor;
