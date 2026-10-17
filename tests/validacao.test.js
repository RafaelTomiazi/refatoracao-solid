const test = require("node:test");
const assert = require("node:assert");
const { makeOrder, makeCustomer, makeProduct, OrderItem } = require("./helpers");
const OrderValidator = require("../src/services/OrderValidator");
const ProductRepository = require("../src/repositories/ProductRepository");

const repo = new ProductRepository();
const validator = new OrderValidator(repo);
const notebook = repo.findById("p1"); // estoque 8

test("pedido certo passa na validacao", () => {
  assert.doesNotThrow(() => validator.validate(makeOrder({ items: [new OrderItem(notebook, 1)] })));
});

test("pedido sem cliente", () => {
  const order = makeOrder({ items: [new OrderItem(notebook, 1)] });
  order.customer = null;
  assert.throws(() => validator.validate(order), /Cliente obrigatorio/);
});

test("e-mail sem @", () => {
  const order = makeOrder({ customer: makeCustomer("vip", "sudeste", "anaemail.com") });
  assert.throws(() => validator.validate(order), /E-mail do cliente invalido/);
});

test("pedido sem itens", () => {
  assert.throws(() => validator.validate(makeOrder({ items: [] })), /Pedido sem itens/);
});

test("item sem produto", () => {
  assert.throws(() => validator.validate(makeOrder({ items: [new OrderItem(null, 1)] })), /Item sem produto/);
});

test("quantidade zero", () => {
  assert.throws(() => validator.validate(makeOrder({ items: [new OrderItem(notebook, 0)] })), /Quantidade invalida/);
});

test("produto que nao esta no repositorio", () => {
  const order = makeOrder({ items: [new OrderItem(makeProduct("p99"), 1)] });
  assert.throws(() => validator.validate(order), /Produto p99 nao encontrado/);
});

test("estoque insuficiente", () => {
  assert.throws(
    () => validator.validate(makeOrder({ items: [new OrderItem(notebook, 50)] })),
    /Estoque insuficiente para Notebook Pro 14/
  );
});
