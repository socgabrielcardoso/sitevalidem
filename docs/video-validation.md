# Validação técnica do cenário mostrado no vídeo

O vídeo mostra uma variável de carrinho no navegador e uma alteração manual semelhante a `carrinho[0].valor = 0.05`, seguida de atualização da interface. Esse trecho demonstra corretamente que o estado JavaScript executado no dispositivo do usuário pode ser alterado pelo próprio usuário.

A alteração visual ou local, sozinha, não prova uma vulnerabilidade no servidor. O problema existe quando o backend recebe preço, total, desconto ou estado de pagamento do cliente e trata esse dado como fonte de verdade.

O fluxo defensivo mostrado no vídeo está conceitualmente correto quando o cliente envia apenas um identificador do item e a quantidade, o servidor consulta a fonte confiável, calcula o preço, cria a cobrança e só libera o produto após confirmar o pagamento.

A confirmação de pagamento precisa de um cuidado adicional. Não basta confiar em uma página de retorno ou em um campo `paid` vindo do navegador. O servidor deve validar a notificação do provedor, autenticar o webhook conforme o mecanismo oferecido, reconciliar o identificador da transação e conferir o valor antes de mudar o estado do pedido.

O ValideM automatiza a parte observável desse problema. Ele procura campos monetários controlados pelo cliente, divergência com catálogo, quantidades fora da regra, itens inexistentes e estados de pagamento enviados pelo navegador. A leitura de HAR permite encontrar os mesmos padrões em tráfego capturado para análise defensiva.

O scanner não afirma que um site é explorável apenas porque encontrou um campo `price` ou `amount`. A prova de aceitação indevida depende do comportamento real do backend e deve ser feita somente em ambiente autorizado.

Referências técnicas:

* OWASP Web Parameter Tampering: https://owasp.org/www-community/attacks/Web_Parameter_Tampering
* OWASP Business Logic Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Business_Logic_Security_Cheat_Sheet.html
* OWASP Third Party Payment Gateway Integration Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Payment_Gateway_Integration_Cheat_Sheet.html
* MITRE CWE 602 Client Side Enforcement of Server Side Security: https://cwe.mitre.org/data/definitions/602.html
