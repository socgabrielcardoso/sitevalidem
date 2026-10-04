# ValideM — notas do projeto

## Problema estudado

Aplicações podem confiar demais em valores enviados pelo navegador. Quando preço, desconto, propriedade ou permissão chegam do cliente sem nova validação no backend, surgem falhas de lógica de negócio.

## O que o projeto testa

- alteração de campos em requisições;
- preço e desconto;
- propriedade de objetos;
- mass assignment;
- validação server-side;
- replay;
- concorrência;
- análise de HAR;
- evidência para reteste.

## Regra central

A interface não é uma fronteira de segurança. Valores críticos precisam ser calculados ou confirmados por uma fonte confiável no servidor.
