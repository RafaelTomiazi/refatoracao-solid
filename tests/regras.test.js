const test = require("node:test");
const assert = require("node:assert");
const { makeOrder, makeProduct, OrderItem } = require("./helpers");
const DiscountCalculator = require("../src/discounts/DiscountCalculator");
const { CustomerTypeDiscount, CouponDiscount, HighValueOrderDiscount } = require("../src/discounts/DiscountRules");
const FreightCalculator = require("../src/freight/FreightCalculator");
const PaymentProcessor = require("../src/payments/PaymentProcessor");
const { PixPayment, CreditCardPayment, BoletoPayment } = require("../src/payments/PaymentMethods");

// ---------- descontos ----------

test("cliente vip ganha 8% de desconto", () => {
  const regra = new CustomerTypeDiscount("vip", 0.08);
  assert.strictEqual(regra.calculate(makeOrder({ type: "vip" }), 1000), 80);
  assert.strictEqual(regra.calculate(makeOrder({ type: "regular" }), 1000), 0);
});

test("cupom TECH10 da 10% e outro cupom nao da nada", () => {
  const regra = new CouponDiscount("TECH10", 0.1);
  assert.strictEqual(regra.calculate(makeOrder({ coupon: "TECH10" }), 1000), 100);
  assert.strictEqual(regra.calculate(makeOrder({ coupon: "OUTRO" }), 1000), 0);
});

test("pedido acima de 8000 ganha 250 fixo", () => {
  const regra = new HighValueOrderDiscount(8000, 250);
  assert.strictEqual(regra.calculate(makeOrder(), 8001), 250);
  assert.strictEqual(regra.calculate(makeOrder(), 8000), 0);
});

test("calculadora soma todas as regras", () => {
  const calc = new DiscountCalculator([
    new CustomerTypeDiscount("vip", 0.08),
    new CouponDiscount("TECH10", 0.1),
    new HighValueOrderDiscount(8000, 250)
  ]);
  const order = makeOrder({ type: "vip", coupon: "TECH10" });
  // 800 + 1000 + 250
  assert.strictEqual(calc.calculate(order, 10000), 2050);
});

test("da pra adicionar regra nova sem mexer na calculadora (OCP)", () => {
  // regra inventada so pro teste, tipo um desconto universitario
  const universitario = { calculate: (order, subtotal) => subtotal * 0.05 };
  const calc = new DiscountCalculator([universitario]);
  assert.strictEqual(calc.calculate(makeOrder(), 200), 10);
});

// ---------- frete ----------

const tabela = {
  sudeste: { base: 20, perKg: 4 },
  norte: { base: 60, perKg: 9 }
};
const frete = new FreightCalculator(tabela, { base: 50, perKg: 8 }, "FRETEGRATIS");

test("frete usa a tabela da regiao", () => {
  const order = makeOrder({ region: "norte", items: [new OrderItem(makeProduct("p1", 100, 2), 1)] });
  assert.strictEqual(frete.calculate(order), 60 + 2 * 9);
});

test("regiao fora da tabela usa o valor padrao", () => {
  const order = makeOrder({ region: "lua", items: [new OrderItem(makeProduct("p1", 100, 1), 2)] });
  assert.strictEqual(frete.calculate(order), 50 + 2 * 8);
});

test("cupom FRETEGRATIS zera o frete", () => {
  const order = makeOrder({ region: "norte", coupon: "FRETEGRATIS" });
  assert.strictEqual(frete.calculate(order), 0);
});

// ---------- pagamento ----------

test("todas as formas de pagamento devolvem o mesmo formato (Liskov)", () => {
  const formas = [new PixPayment(), new CreditCardPayment(), new BoletoPayment()];
  for (const forma of formas) {
    const resultado = forma.process(makeOrder(), 1000);
    assert.deepStrictEqual(Object.keys(resultado).sort(), ["discount", "fee", "status"]);
    assert.strictEqual(typeof resultado.fee, "number");
    assert.strictEqual(typeof resultado.discount, "number");
  }
});

test("pix aprova e da 3% de desconto", () => {
  assert.deepStrictEqual(new PixPayment().process(makeOrder(), 1000), { status: "approved", fee: 0, discount: 30 });
});

test("cartao so cobra taxa quando e parcelado", () => {
  const cartao = new CreditCardPayment();
  assert.strictEqual(cartao.process(makeOrder({ installments: 1 }), 1000).fee, 0);
  assert.strictEqual(cartao.process(makeOrder({ installments: 3 }), 1000).fee, 25);
});

test("boleto fica aguardando pagamento", () => {
  assert.strictEqual(new BoletoPayment().process(makeOrder(), 1000).status, "waiting_payment");
});

test("forma de pagamento que nao existe da erro", () => {
  const processor = new PaymentProcessor({ pix: new PixPayment() });
  assert.throws(() => processor.process(makeOrder({ payment: "dinheiro" }), 100), /Forma de pagamento invalida/);
});
