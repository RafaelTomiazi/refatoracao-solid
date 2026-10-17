class NotificationService {
  sendOrderConfirmation(customer, orderId, total) {
    console.log(`[EMAIL] Para: ${customer.email} | Pedido ${orderId} confirmado. Total: R$ ${total.toFixed(2)}`);
  }
}
module.exports = NotificationService;
