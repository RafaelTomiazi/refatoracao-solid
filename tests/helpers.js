// funcoes pra montar pedidos nos testes sem repetir tudo
const Address = require("../src/domain/Address");
const Customer = require("../src/domain/Customer");
const Order = require("../src/domain/Order");
const OrderItem = require("../src/domain/OrderItem");
const Product = require("../src/domain/Product");

function makeCustomer(type = "regular", region = "sudeste", email = "ana@teste.com") {
  return new Customer(
    "c1",
    "Ana Souza",
    email,
    "18999990000",
    type,
    new Address("Rua das Palmeiras", "120", "Presidente Prudente", "SP", "19000-000", region)
  );
}

function makeProduct(id = "p1", price = 100, weight = 1, stock = 10) {
  return new Product(id, "Produto " + id, "teste", price, weight, stock);
}

function makeOrder(options = {}) {
  const customer = options.customer || makeCustomer(options.type, options.region);
  const items = options.items || [new OrderItem(makeProduct(), 1)];
  return new Order(
    "o1",
    customer,
    items,
    options.coupon || null,
    options.payment || "pix",
    options.installments || 1
  );
}

module.exports = { makeCustomer, makeProduct, makeOrder, OrderItem };
