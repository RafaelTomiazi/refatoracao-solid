// Soma o desconto de todas as regras que ele recebe.
// Ele nao conhece nenhuma regra especifica, so a lista (composicao).
class DiscountCalculator {
  constructor(rules) {
    this.rules = rules;
  }

  calculate(order, subtotal) {
    let discount = 0;

    for (const rule of this.rules) {
      discount += rule.calculate(order, subtotal);
    }

    return discount;
  }
}

module.exports = DiscountCalculator;
