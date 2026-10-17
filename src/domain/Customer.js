class Customer {
  constructor(id, name, email, phone, type, address) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.type = type;
    this.address = address;
  }

  // a validacao do e-mail fica aqui porque o dado e do cliente
  hasValidEmail() {
    return Boolean(this.email) && this.email.includes("@");
  }

  isType(type) {
    return this.type === type;
  }

  // esses metodos existem pra ninguem precisar fazer customer.address.region
  // (Principio de Demeter)
  getRegion() {
    return this.address.region;
  }

  getCity() {
    return this.address.city;
  }

  getState() {
    return this.address.state;
  }
}

module.exports = Customer;
