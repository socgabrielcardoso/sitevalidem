# Threat model

## Ativo protegido

Integridade do preço, total do pedido, descontos, taxas, quantidade e estado de pagamento.

## Fronteira de confiança

O navegador pertence ao usuário. HTML, JavaScript, armazenamento local, memória da página, console e requisições originadas no cliente são manipuláveis e não formam uma fronteira de segurança.

## Cenários monitorados

1. Campo de preço ou total enviado no body ou query string.
2. Valor enviado que diverge do catálogo confiável.
3. Valor muito baixo usado como indicador de adulteração.
4. Quantidade negativa, fracionária, zero ou acima do limite.
5. Item inexistente ou inativo.
6. Estado de pagamento declarado pelo cliente.
7. Requisição sem identificador capaz de permitir recálculo no backend.

## Controles esperados

1. Esquema de entrada com allowlist de campos.
2. Recálculo server side usando catálogo confiável.
3. Regras de desconto e taxas executadas no servidor.
4. Criação de cobrança com valor derivado pelo servidor.
5. Webhook autenticado e reconciliação da transação.
6. Idempotência em criação e confirmação do pedido.
7. Log de divergências e tentativas de adulteração.
8. Alertas para repetição, automação e abuso de regra de negócio.

## Limite do detector

ValideM é um analisador defensivo de payloads e arquivos HAR. Ele aponta indícios e diferenças verificáveis no lado cliente. Ele não substitui revisão de código do backend, teste de integração do gateway ou teste dinâmico autorizado.
