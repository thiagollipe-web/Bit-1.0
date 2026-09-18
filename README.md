# BIT — Linguagem Brasileira para Criação de Jogos 2D

BIT é uma linguagem textual em português para criação de jogos 2D. Os programas usam a extensão .bit e são executados pelo runtime TypeScript no navegador.

## Arquitetura

- Lexer: src/lexer.ts
- Parser/AST: src/parser.ts
- Interpretador: src/interp/interpreter.ts
- Biblioteca padrão: src/interp/builtins.ts
- Runtime: src/runtime/
- IDE: index.html + src/main.ts
- Exemplos: examples/
- Testes: tests/
- Referência: docs/BIT-LANGUAGE-REFERENCE.md

## Exemplo

```bit
tela 160x120
fundo preto

ator Jogador
  desenho quadrado 8, verde
  posição 20, 20
  controlado por setas
  limita à tela
fim
```

## Desenvolvimento

```bash
npm install
npm run dev
npm test
npm run build
npm run verify
```

A série 1.x prioriza simplicidade para iniciantes, mensagens de erro claras e uma engine pequena para jogos retro.
