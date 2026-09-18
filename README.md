# MicroConda

MicroConda é um ambiente educacional, mobile-first e executado no navegador para criação de jogos 2D com uma linguagem textual em português.

O repositório reúne o compilador da linguagem, interpretador, runtime de jogos, IDE, biblioteca de comandos, exemplos e testes.

## Estrutura

- Lexer: `src/lexer.ts`
- Parser/AST: `src/parser.ts`
- Interpretador: `src/interp/interpreter.ts`
- Biblioteca padrão: `src/interp/builtins.ts`
- Runtime: `src/runtime/`
- IDE: `index.html` + `src/main.ts`
- Biblioteca: `src/library-data.ts`
- Exemplos: `examples/`
- Testes: `tests/`
- Referência: `docs/MICROCONDA-LANGUAGE-REFERENCE.md`

## Primeiro programa

```microconda
tela 40x25
fundo preto

ator Jogador
  desenho quadrado 1, verde
  posição 10, 12
  controlado por setas
  limita à tela

  quando atualiza:
    diga "MicroConda em execução"
  fim
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

## Princípios

MicroConda prioriza uma sintaxe em português, feedback de erro explícito, execução determinística dentro de limites, funcionamento local no navegador e uma experiência simples para iniciantes.

A extensão de projeto usada pelo Studio é `.micro`.
