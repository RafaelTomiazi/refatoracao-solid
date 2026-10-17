// Classe so pra validar o pedido. Antes isso tudo ficava no comeco
// do OrderService.process()
class OrderValidator {
  constructor(productRepository) {
    // recebe o repositorio de fora em vez de dar new aqui dentro
    this.productRepository = productRepository;
  }

  validate(order) {
    if (!order.customer) {
      throw new Error("Cliente obrigatorio.");
    }

    if (!order.customer.hasValidEmail()) {
      throw new Error("E-mail do cliente invalido.");
    }

    if (!order.hasItems()) {
      throw new Error("Pedido sem itens.");
    }

    for (const item of order.items) {
      this.validateItem(item);
    }
  }

  validateItem(item) {
    if (!item.hasProduct()) {
      throw new Error("Item sem produto.");
    }

    if (item.quantity <= 0) {
      throw new Error("Quantidade invalida.");
    }

    const product = this.productRepository.findById(item.getProductId());

    if (!product) {
      throw new Error(`Produto ${item.getProductId()} nao encontrado.`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`Estoque insuficiente para ${product.name}.`);
    }
  }
}

module.exports = OrderValidator;
