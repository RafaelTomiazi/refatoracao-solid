# TechStore - Refatoração com SOLID

Atividade da disciplina Design de Software (Unoeste). O projeto original é da professora: [vanessaborges2/refatoracao-solid](https://github.com/vanessaborges2/refatoracao-solid).

O sistema cria pedidos, calcula desconto, frete, pagamento, baixa estoque, salva o pedido e avisa o cliente. Ele já funcionava, mas quase tudo ficava dentro do `OrderService.process()`. A ideia aqui foi separar as responsabilidades sem mudar o resultado.

Obs: o arquivo `src/services/NotificationService.js` não estava no repositório original e o projeto não rodava (`Cannot find module './NotificationService'`). Criei ele com o método que o `OrderService` já chamava, `sendOrderConfirmation(customer, orderId, total)`, mostrando a mensagem no console.

## Como rodar

Precisa do Node.js 20 ou mais novo. Não tem dependência pra instalar.

```bash
npm start   # roda o pedido de exemplo
npm test    # roda os testes
```

## Como ficou a estrutura

```
src/
  app.js                      monta o OrderService com todas as dependências
  index.js                    pedido de exemplo
  domain/                     Order, OrderItem, Customer, Address, Product
  services/
    OrderService.js           só coordena o processo
    OrderValidator.js         validações do pedido
    OrderSummary.js           monta o objeto de resumo
    OrderPrinter.js           imprime o resumo no console
    NotificationService.js    "envia" o e-mail de confirmação
  discounts/
    DiscountCalculator.js     soma as regras de desconto
    DiscountRules.js          vip/funcionário, cupom, pedido acima de 8000
  freight/
    FreightCalculator.js      frete pela tabela de regiões
  payments/
    PaymentProcessor.js       escolhe a forma de pagamento
    PaymentMethods.js         pix, cartão e boleto
  repositories/               ProductRepository e OrderRepository
  utils/Logger.js
tests/                        testes com node:test
```

## Principais mudanças

- O `OrderService` não dá mais `new` nas dependências. Ele recebe tudo pelo construtor e quem monta é o `app.js` (inversão de dependência).
- Validação, desconto, frete, pagamento, resumo e impressão saíram do `OrderService`, cada um foi pra sua classe (responsabilidade única).
- Os `if/else` de desconto, frete e pagamento viraram classes ou tabela. Pra adicionar um desconto ou forma de pagamento nova é só criar a classe e registrar no `app.js` (aberto/fechado).
- Todas as formas de pagamento devolvem `{ status, fee, discount }`, então dá pra trocar uma pela outra (Liskov).
- Cada dependência do `OrderService` tem um papel pequeno, ex: o notificador só precisa de `sendOrderConfirmation` e a impressão só de `print` (segregação de interfaces).
- `Order` e `Customer` ganharam métodos como `getShippingRegion()` e `hasValidEmail()`, pra não ficar fazendo `order.customer.address.region` (Princípio de Demeter).
- O repositório de produtos agora é um só. Antes o `OrderService` criava outro, diferente do que o `index.js` usava.

## Testes

São 30 testes em `tests/`. Os de `comportamento.test.js` comparam o resultado com valores que eu tirei rodando o código original antes de refatorar.
