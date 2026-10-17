const createOrderSummary = require("./OrderSummary");

// Depois da refatoracao o OrderService so coordena o processo.
// Cada parte (validar, desconto, frete, pagamento, salvar, avisar, imprimir)
// e feita por outra classe que ele recebe pronta no construtor.
// Assim ele depende do "papel" de cada uma e nao de uma classe concreta (DIP),
// e da pra trocar qualquer peca nos testes.
class OrderService {
  constructor(dependencies) {
    this.validator = dependencies.validator;
    this.discountCalculator = dependencies.discountCalculator;
    this.freightCalculator = dependencies.freightCalculator;
    this.paymentProcessor = dependencies.paymentProcessor;
    this.productRepository = dependencies.productRepository;
    this.orderRepository = dependencies.orderRepository;
    this.notificationService = dependencies.notificationService;
    this.printer = dependencies.printer;
    this.logger = dependencies.logger;
  }

  process(order) {
    this.logger.info(`Iniciando processamento do pedido ${order.id}.`);

    this.validator.validate(order);

    const subtotal = order.getSubtotal();
    let discount = this.discountCalculator.calculate(order, subtotal);
    const freight = this.freightCalculator.calculate(order);
    const payment = this.paymentProcessor.process(order, subtotal);

    // o pix da desconto, entao soma com os outros descontos
    discount += payment.discount;

    const total = Number((subtotal - discount + freight + payment.fee).toFixed(2));

    if (total <= 0) {
      throw new Error("Total do pedido invalido.");
    }

    this.updateStock(order);
    order.updateStatusByPayment(payment.status);

    const summary = createOrderSummary(order, {
      subtotal,
      discount,
      freight,
      paymentFee: payment.fee,
      total
    });

    this.orderRepository.save(summary);
    this.notifyCustomer(order, total);
    this.printer.print(order, summary);

    return summary;
  }

  updateStock(order) {
    for (const item of order.items) {
      this.productRepository.updateStock(item.getProductId(), item.quantity);
    }
  }

  notifyCustomer(order, total) {
    if (order.isConfirmed()) {
      this.notificationService.sendOrderConfirmation(order.customer, order.id, total);
    } else {
      this.logger.warn(`Pedido ${order.id} aguardando pagamento.`);
    }
  }
}

module.exports = OrderService;
