// Aqui e o unico lugar que da "new" nas classes concretas e liga tudo.
// Se precisar trocar o banco, o jeito de notificar ou incluir uma regra
// de desconto nova, a mudanca fica aqui e o OrderService nao muda.
const OrderService = require("./services/OrderService");
const OrderValidator = require("./services/OrderValidator");
const OrderPrinter = require("./services/OrderPrinter");
const NotificationService = require("./services/NotificationService");
const ProductRepository = require("./repositories/ProductRepository");
const OrderRepository = require("./repositories/OrderRepository");
const DiscountCalculator = require("./discounts/DiscountCalculator");
const { CustomerTypeDiscount, CouponDiscount, HighValueOrderDiscount } = require("./discounts/DiscountRules");
const FreightCalculator = require("./freight/FreightCalculator");
const PaymentProcessor = require("./payments/PaymentProcessor");
const { PixPayment, CreditCardPayment, BoletoPayment } = require("./payments/PaymentMethods");
const Logger = require("./utils/Logger");

// tabela de frete por regiao (antes era if/else)
const regionRates = {
  sudeste: { base: 20, perKg: 4 },
  sul: { base: 28, perKg: 5 },
  "centro-oeste": { base: 35, perKg: 6 },
  nordeste: { base: 45, perKg: 7 },
  norte: { base: 60, perKg: 9 }
};
const defaultRate = { base: 50, perKg: 8 };

function createOrderService(productRepository = new ProductRepository()) {
  // o mesmo repositorio de produtos e usado por quem cria o pedido,
  // pela validacao e pela baixa de estoque. No original o OrderService
  // criava outro repositorio so dele.
  const orderRepository = new OrderRepository();

  const discountCalculator = new DiscountCalculator([
    new CustomerTypeDiscount("vip", 0.08),
    new CustomerTypeDiscount("employee", 0.15),
    new CouponDiscount("TECH10", 0.1),
    new HighValueOrderDiscount(8000, 250)
  ]);

  const paymentProcessor = new PaymentProcessor({
    pix: new PixPayment(),
    credit_card: new CreditCardPayment(),
    boleto: new BoletoPayment()
  });

  const service = new OrderService({
    validator: new OrderValidator(productRepository),
    discountCalculator,
    freightCalculator: new FreightCalculator(regionRates, defaultRate, "FRETEGRATIS"),
    paymentProcessor,
    productRepository,
    orderRepository,
    notificationService: new NotificationService(),
    printer: new OrderPrinter(),
    logger: new Logger()
  });

  return { service, productRepository, orderRepository };
}

module.exports = { createOrderService };
