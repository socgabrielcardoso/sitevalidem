# Object Ownership

Identificadores enviados pelo cliente não provam propriedade.

Antes de ler ou alterar um objeto, o backend deve confirmar que a identidade autenticada possui permissão sobre aquele recurso.

Esse princípio reduz IDOR/BOLA e abuso de lógica.