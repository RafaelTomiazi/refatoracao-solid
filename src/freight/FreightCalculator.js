// Calcula o frete. Antes era um if/else enorme por regiao dentro do OrderService.
// Agora os valores ficam numa tabela que vem de fora, entao pra mudar preco
// ou adicionar regiao nao precisa mexer nessa classe.
class FreightCalculator {
  constructor(regionRates, defaultRate, freeShippingCoupon) {
    this.regionRates = regionRates;   // { sudeste: { base: 20, perKg: 4 }, ... }
    this.defaultRate = defaultRate;   // usado quando a regiao nao esta na tabela
    this.freeShippingCoupon = freeShippingCoupon;
  }

  calculate(order) {
    if (order.hasCoupon(this.freeShippingCoupon)) {
      return 0;
    }

    const rate = this.regionRates[order.getShippingRegion()] || this.defaultRate;

    return rate.base + order.getTotalWeight() * rate.perKg;
  }
}

module.exports = FreightCalculator;
