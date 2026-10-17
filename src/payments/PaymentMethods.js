// Formas de pagamento. Todas tem process(order, subtotal) e devolvem
// sempre o mesmo formato: { status, fee, discount }.
// Como todas respeitam esse "contrato", o OrderService pode usar qualquer
// uma sem saber qual e (Liskov).

class PixPayment {
  process(order, subtotal) {
    // pix aprova na hora e da 3% de desconto
    return { status: "approved", fee: 0, discount: subtotal * 0.03 };
  }
}

class CreditCardPayment {
  process(order, subtotal) {
    let fee = 0;

    // parcelado tem taxa de 2,5%
    if (order.installments > 1) {
      fee = subtotal * 0.025;
    }

    return { status: "approved", fee: fee, discount: 0 };
  }
}

class BoletoPayment {
  process(order, subtotal) {
    // boleto fica esperando o cliente pagar
    return { status: "waiting_payment", fee: 0, discount: 0 };
  }
}

module.exports = { PixPayment, CreditCardPayment, BoletoPayment };
