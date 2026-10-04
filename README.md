# ValideM

Laboratório de **Application Security** focado em falhas de lógica de negócio e confiança indevida em dados enviados pelo cliente.

O cenário principal é simples: mostrar por que valores como preço, desconto, quantidade, propriedade e permissões não podem ser aceitos pelo backend apenas porque vieram da interface.

## Assuntos trabalhados

- client-side tampering
- manipulação de preço e desconto
- trust boundaries
- BOLA / IDOR
- mass assignment
- validação server-side
- replay e concorrência
- análise de HAR e JSON
- registro de evidências
- reteste após correção

## Testes

O repositório possui testes específicos para detector, evidências, HAR, scoring e simulador em `tests/`.

## Estrutura

- `index.html` — interface do laboratório
- `assets/` — código e recursos da aplicação
- `tests/` — testes automatizados e casos de validação
- `ci/` — verificações de CI
- `docs/` — documentação técnica

## Uso

Os cenários são sintéticos e devem permanecer assim. O projeto não foi feito para testar sistemas de terceiros sem autorização.

Arquivos HAR, cookies, tokens e dados reais devem ser removidos antes de qualquer commit.
