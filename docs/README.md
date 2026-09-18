# MicroConda Documentation

A documentação canônica da linguagem está em [MicroConda-LANGUAGE-REFERENCE.md](./MicroConda-LANGUAGE-REFERENCE.md).

A gramática declarativa usada por ferramentas está em [../src/grammar.ts](../src/grammar.ts).

A biblioteca padrão está descrita em [../stdlib/README.md](../stdlib/README.md).

Exemplos executáveis ficam em [../examples](../examples).

## Modelo de desenvolvimento

1. Criar um arquivo `jogo.micro` em qualquer editor de texto simples.
2. Validar o código com o lexer/parser da MicroConda.
3. Executar no runtime.
4. Empacotar o projeto somente quando a linguagem estiver estável.

## Regra de compatibilidade

A especificação documenta apenas sintaxe que deve ser tratada como API da linguagem. Novos recursos devem ser adicionados ao lexer, parser, runtime, biblioteca e testes de forma coordenada.
