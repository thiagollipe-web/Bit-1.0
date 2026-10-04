# Bit Agent

O Bit Agent é uma camada de agente sobre a linguagem Bit para criar, modificar, validar e executar jogos 2D diretamente no navegador.

## Motor simbólico

A versão 1.3 adiciona um pequeno motor simbólico que funciona sem modelo generativo.

```text
Entrada
  ↓
normalização + aproximação
  ↓
intenção + entidades
  ↓
memória + contexto
  ↓
grafo de conhecimento
  ↓
regras de inferência
  ↓
resposta / tarefa / alteração
```

O núcleo inclui:

- memória permanente no navegador usando localStorage;
- memória de curto prazo com histórico das últimas interações;
- intenções conversacionais;
- entidades e aliases;
- sinônimos com busca aproximada por distância de edição;
- grafo de conhecimento em relações sujeito → relação → objeto;
- regras de dedução para diagnóstico;
- comandos de memória e conhecimento;
- aprendizado explícito durante a conversa;
- correção e esquecimento de conhecimento;
- calculadora aritmética segura;
- respostas de data e hora;
- importação e exportação de conhecimento em JSON;
- rastreamento simbólico explicável na interface.

## Exemplos

Ensinar fatos:

```text
Meu nome é Thiago
Meu cachorro se chama Thor
Guinho é meu chatbot
Guinho usa servidor
```

Consultar:

```text
Qual é meu nome?
Como se chama meu cachorro?
O que é Guinho?
O Guinho usa servidor?
```

Ensinar um alias:

```text
Quando eu disser "Guinho", estou falando do meu chatbot.
```

Diagnóstico contextual:

```text
Você: Meu servidor caiu.
Bot: Ele ainda está respondendo na porta?
Você: Não.
Bot: Então o problema provavelmente está antes da aplicação. Vamos verificar se o processo do servidor está rodando.
```

O significado de uma resposta curta como "não" vem da pergunta armazenada no contexto.

## Agente de programação

O agente mantém o fluxo:

```text
Solicitação
  ↓
Interpretar intenção
  ↓
Consultar conhecimento
  ↓
Planejar alteração
  ↓
Gerar/modificar código Bit
  ↓
Validar lexer + parser
  ↓
Executar no Canvas
```

A interface permite conversar com o agente e também enviar uma tarefa diretamente para o planejador.

Algumas alterações simbólicas já suportadas incluem adicionar moeda, adicionar inimigo, adicionar pontuação e trocar a cor do fundo. A arquitetura permite ampliar esse conjunto sem transformar o projeto em uma sequência de respostas fixas.

## Interface

O Agent Studio reúne:

- chat simbólico;
- plano de tarefas;
- editor Bit;
- validação;
- Canvas;
- estado da memória;
- estado do contexto;
- grafo de conhecimento;
- traço do processamento simbólico;
- importação/exportação JSON;
- salvamento local do projeto;
- exportação do arquivo `.bit`.

## IA generativa opcional

O servidor de desenvolvimento mantém `/api/ai/assistant` para integração com Google Gemini. Essa camada é opcional.

Sem chave ou modelo generativo, o motor simbólico continua capaz de interpretar intenções, memorizar fatos, consultar relações, aplicar regras e executar o agente Bit localmente.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build e testes

```bash
npm run build
npm test
npm run verify
```

A linguagem Bit continua sendo a camada de programação de jogos. O motor simbólico fica acima dela: entende a solicitação e entrega decisões ao agente, sem substituir o lexer, o parser ou o runtime.
