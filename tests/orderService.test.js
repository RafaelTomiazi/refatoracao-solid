// Aqui eu testo o OrderService passando versoes "falsas" das dependencias.
// Isso so da pra fazer porque ele recebe tudo pelo construtor (DIP).
// No codigo original ele dava new em tudo la dentro do construtor,
// e nao tinha como testar sem imprimir e mandar e-mail de verdade.
const test = require("node:test");
const assert = require("node:assert");
const { makeOrder, makeProduct, OrderItem } = require("./helpers");
const OrderService = require("../src/services/OrderService");
const OrderValidator = require("../src/services/OrderValidator");
const DiscountCalculator = require("../src/discounts/DiscountCalculator");
const FreightCalculator = require("../src/freight/FreightCalculator");
const PaymentProcessor = require("../src/payments/PaymentProcessor");
const { PixPayment, BoletoPayment } = require("../src/payments/PaymentMethods");

function montarService(produtos, outras = {}) {
  // repositorio em memoria simples so pro teste
  const productRepository = {
    findById: (id) => produtos.find((p) => p.id === id),
    updateStock: (id, qtd) => { produtos.find((p) => p.id === id).stock -= qtd; }
  };
  const salvos = [];
  const emails = [];
  const avisos = [];

  const service = new OrderService({
    validator: new OrderValidator(productRepository),
    discountCalculator: outras.discountCalculator || new DiscountCalculator([]),
    freightCalculator: new FreightCalculator({}, { base: 10, perKg: 0 }, "FRETEGRATIS"),
    paymentProcessor: new PaymentProcessor({ pix: new PixPayment(), boleto: new BoletoPayment() }),
    productRepository,
    orderRepository: { save: (s) => salvos.push(s) },
    notificationService: { sendOrderConfirmation: (cliente, id, total) => emails.push({ id, total }) },
    printer: { print: () => {} },
    logger: { info: () => {}, warn: (msg) => avisos.push(msg) }
  });

  return { service, salvos, emails, avisos };
}

test("pedido no pix e confirmado, salvo, baixa estoque e manda e-mail", () => {
  const produto = makeProduct("p1", 100, 1, 10);
  const { service, salvos, emails, avisos } = montarService([produto]);

  const resumo = service.process(makeOrder({ items: [new OrderItem(produto, 2)], payment: "pix" }));

  // 200 - 6 (pix 3%) + 10 de frete
  assert.strictEqual(resumo.total, 204);
  assert.strictEqual(resumo.status, "confirmed");
  assert.strictEqual(produto.stock, 8);
  assert.strictEqual(salvos.length, 1);
  assert.deepStrictEqual(emails, [{ id: "o1", total: 204 }]);
  assert.strictEqual(avisos.length, 0);
});

test("pedido no boleto nao manda e-mail, so registra aviso", () => {
  const produto = makeProduct("p1", 100, 1, 10);
  const { service, emails, avisos } = montarService([produto]);

  const resumo = service.process(makeOrder({ items: [new OrderItem(produto, 1)], payment: "boleto" }));

  assert.strictEqual(resumo.status, "waiting_payment");
  assert.strictEqual(emails.length, 0);
  assert.deepStrictEqual(avisos, ["Pedido o1 aguardando pagamento."]);
});

test("total zerado ou negativo da erro e nao mexe no estoque", () => {
  const produto = makeProduct("p1", 100, 1, 10);
  const descontoGigante = { calculate: () => 1000 };
  const { service, salvos } = montarService([produto], { discountCalculator: descontoGigante });

  assert.throws(() => service.process(makeOrder({ items: [new OrderItem(produto, 1)] })), /Total do pedido invalido/);
  assert.strictEqual(produto.stock, 10);
  assert.strictEqual(salvos.length, 0);
});

test("se a validacao falha nada e salvo", () => {
  const produto = makeProduct("p1", 100, 1, 10);
  const { service, salvos, emails } = montarService([produto]);

  assert.throws(() => service.process(makeOrder({ items: [new OrderItem(produto, 99)] })), /Estoque insuficiente/);
  assert.strictEqual(salvos.length, 0);
  assert.strictEqual(emails.length, 0);
});
