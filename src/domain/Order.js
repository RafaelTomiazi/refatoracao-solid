class Order {
  constructor(id, customer, items, couponCode, paymentMethod, installments) {
    this.id = id;
    this.customer = customer;
    this.items = items;
    this.couponCode = couponCode;
    this.paymentMethod = paymentMethod;
    this.installments = installments;
    this.status = "created";
    this.createdAt = new Date();
  }

  hasItems() {
    return Boolean(this.items) && this.items.length > 0;
  }

  hasCoupon(code) {
    return this.couponCode === code;
  }

  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((total, item) => total + item.getSubtotal(), 0);
  }

  getTotalWeight() {
    return this.items.reduce((total, item) => total + item.getWeight(), 0);
  }

  // o pedido pergunta pro cliente, quem usa o pedido nao precisa
  // conhecer o endereco (Demeter)
  getShippingRegion() {
    return this.customer.getRegion();
  }

  // o status passa a ser decidido aqui dentro em vez de ser setado de fora
  updateStatusByPayment(paymentStatus) {
    this.status = paymentStatus === "approved" ? "confirmed" : "waiting_payment";
  }

  isConfirmed() {
    return this.status === "confirmed";
  }
}

module.exports = Order;
