// Regras de desconto. Todas tem o mesmo metodo calculate(order, subtotal)
// e devolvem o valor do desconto (0 quando a regra nao se aplica).
// Pra criar um desconto novo (universitario, black friday...) e so criar
// outra classe aqui e colocar na lista do index, sem mexer nas outras (OCP).

// desconto por tipo de cliente (vip 8%, funcionario 15%)
class CustomerTypeDiscount {
  constructor(customerType, percentage) {
    this.customerType = customerType;
    this.percentage = percentage;
  }

  calculate(order, subtotal) {
    if (order.customer.isType(this.customerType)) {
      return subtotal * this.percentage;
    }
    return 0;
  }
}

// desconto de cupom (ex: TECH10 = 10%)
class CouponDiscount {
  constructor(couponCode, percentage) {
    this.couponCode = couponCode;
    this.percentage = percentage;
  }

  calculate(order, subtotal) {
    if (order.hasCoupon(this.couponCode)) {
      return subtotal * this.percentage;
    }
    return 0;
  }
}

// valor fixo de desconto quando o pedido passa de um limite (acima de 8000 ganha 250)
class HighValueOrderDiscount {
  constructor(minimumValue, discountValue) {
    this.minimumValue = minimumValue;
    this.discountValue = discountValue;
  }

  calculate(order, subtotal) {
    if (subtotal > this.minimumValue) {
      return this.discountValue;
    }
    return 0;
  }
}

module.exports = { CustomerTypeDiscount, CouponDiscount, HighValueOrderDiscount };
