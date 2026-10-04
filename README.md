# Bit Agent

O Bit agora funciona como uma pequena fábrica de jogos 2D assistida por agente.

## Recursos

- Agente Bit para transformar uma descrição em plano de desenvolvimento.
- Sistema de tarefas com estados e progresso.
- Validação real usando lexer e parser antes da execução.
- Editor de código .bit.
- Runtime e Canvas usando o motor do Bit.
- Salvamento local no navegador.
- Exportação de projetos .bit.
- Arquitetura preparada para LLMs locais ou Google Gemini.

## Fluxo

Descrição -> Planejamento -> Tarefas -> Código Bit -> Validação -> Runtime -> Iteração.

## Desenvolvimento

    npm install
    npm run dev

## Build e testes

    npm run build
    npm test
    npm run verify

## IA externa opcional

O servidor de desenvolvimento mantém /api/ai/assistant. Para usar Gemini, configure GEMINI_API_KEY. A interface principal continua funcionando sem chave, usando o agente local para planejamento e geração inicial.

O Bit continua sendo uma linguagem brasileira para criação de jogos 2D. O agente é uma camada sobre a linguagem e não substitui sua sintaxe, parser ou runtime.
