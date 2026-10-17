class OrderItem {
  constructor(product, quantity) {
    this.product = product;
    this.quantity = quantity;
  }

  hasProduct() {
    return Boolean(this.product);
  }

  getProductId() {
    return this.product.id;
  }

  getProductName() {
    return this.product.name;
  }

  getSubtotal() {
    return this.product.price * this.quantity;
  }

  // peso total do item (peso do produto x quantidade)
  getWeight() {
    return this.product.weight * this.quantity;
  }
}

module.exports = OrderItem;
