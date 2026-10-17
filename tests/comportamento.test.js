// Testes pra garantir que a refatoracao nao mudou o resultado.
// Os valores esperados aqui eu tirei rodando o codigo ORIGINAL com os
// mesmos pedidos (antes de refatorar).
const test = require("node:test");
const assert = require("node:assert");
const Address = require("../src/domain/Address");
const Customer = require("../src/domain/Customer");
const Order = require("../src/domain/Order");
const OrderItem = require("../src/domain/OrderItem");
const { createOrderService } = require("../src/app");

function rodarPedido(t, tipo, regiao, cupom, pagamento, parcelas, itens) {
  // silencia o console pra nao poluir a saida dos testes
  t.mock.method(console, "log", () => {});

  const { service, productRepository } = createOrderService();
  const cliente = new Customer("c1", "Ana", "ana@x.com", "1", tipo,
    new Address("Rua", "1", "Prudente", "SP", "19000-000", regiao));
  const order = new Order(
    "o1",
    cliente,
    itens.map(([id, qtd]) => new OrderItem(productRepository.findById(id), qtd)),
    cupom,
    pagamento,
    parcelas
  );
  return { resumo: service.process(order), productRepository };
}

function valores(r) {
  return [r.subtotal, r.discount, r.freight, r.paymentFee, r.total, r.status];
}

test("pedido do index (vip, TECH10, cartao 3x, sudeste) igual ao original", (t) => {
  const { resumo, productRepository } = rodarPedido(t, "vip", "sudeste", "TECH10", "credit_card", 3, [["p1", 1], ["p2", 2]]);
  assert.deepStrictEqual(valores(resumo), [6440, 1159.2, 30, 161, 5471.8, "confirmed"]);
  // estoque baixou
  assert.strictEqual(productRepository.findById("p1").stock, 7);
  assert.strictEqual(productRepository.findById("p2").stock, 28);
});

test("cliente comum no pix, sul", (t) => {
  const { resumo } = rodarPedido(t, "regular", "sul", null, "pix", 1, [["p2", 1]]);
  assert.deepStrictEqual(valores(resumo), [120, 3.6, 29, 0, 145.4, "confirmed"]);
});

test("funcionario, FRETEGRATIS, boleto, norte", (t) => {
  const { resumo } = rodarPedido(t, "employee", "norte", "FRETEGRATIS", "boleto", 1, [["p3", 3], ["p4", 2]]);
  assert.deepStrictEqual(valores(resumo), [5110, 766.5, 0, 0, 4343.5, "waiting_payment"]);
});

test("pedido acima de 8000, vip, TECH10, nordeste", (t) => {
  const { resumo } = rodarPedido(t, "vip", "nordeste", "TECH10", "credit_card", 1, [["p1", 1], ["p3", 2]]);
  assert.deepStrictEqual(valores(resumo), [9100, 1888, 135.3, 0, 7347.3, "confirmed"]);
});

test("regiao desconhecida e cupom invalido", (t) => {
  const { resumo } = rodarPedido(t, "regular", "exterior", "INVALIDO", "credit_card", 3, [["p1", 1], ["p2", 2]]);
  assert.deepStrictEqual(valores(resumo), [6440, 0, 70, 161, 6671, "confirmed"]);
});
