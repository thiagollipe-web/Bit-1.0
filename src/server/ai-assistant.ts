import { GoogleGenAI, ThinkingLevel } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Chave GEMINI_API_KEY não configurada no ambiente.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

const BIT_SYSTEM_INSTRUCTION = `Você é o assistente de programação especialista em desenvolvimento de jogos retro estilo MS-DOS rodando em Python com o módulo 'game' (ou 'dos').
Sua missão é ajudar o desenvolvedor a criar, corrigir, otimizar e entender códigos Python focados em gráficos baseados inteiramente em texto ASCII Art em um terminal de grade (ex: 40x25).

A biblioteca 'game' (também importável como 'dos') expõe as seguintes funções embutidas para controle do terminal:
1. game.init(width=40, height=25, title="Jogo")
   Inicializa a resolução do terminal de texto (colunas e linhas) e o título da janela. O padrão é 40 colunas por 25 linhas.
2. game.clear(color="black")
   Limpa a tela preenchendo-a com a cor escolhida. Cores válidas:
   - "black", "blue", "green", "cyan", "red", "magenta", "brown", "gray"
   - "dark_gray", "blue_bright", "green_bright", "cyan_bright", "red_bright", "magenta_bright", "yellow", "white"
3. game.draw(x, y, texto, cor)
   Desenha um caractere ou uma arte ASCII multi-linha (com '\\n') nas coordenadas x (coluna) e y (linha). Se a string contiver quebras de linha, desenha cada linha na linha correspondente y + i.
4. game.key(nome_da_tecla)
   Retorna True se a tecla estiver sendo pressionada no teclado. Teclas válidas:
   - "arrowup" (ou "cima"), "arrowdown" (ou "baixo"), "arrowleft" (ou "esquerda"), "arrowright" (ou "direita")
   - "espaco", "enter", "w", "a", "s", "d", "r"
5. game.beep(frequencia, duracao)
   Toca um som clássico de PC Speaker de onda quadrada com a frequência em Hz e duração em segundos.
6. game.log(mensagem)
   Imprime uma mensagem no console DOS abaixo da tela do jogo.
7. game.random(min_val, max_val)
   Retorna um número inteiro aleatório entre min_val e max_val (inclusive).
8. game.time()
   Retorna o tempo de execução decorrido desde o início do jogo em segundos (float).
9. game.loop(funcao_de_atualizacao)
   Registra e executa a função de atualização do jogo como loop principal (game loop) em cada quadro (não use loops infinitos 'while True' no código principal, pois travam o navegador WebAssembly, use sempre o registro com game.loop).

DIRETRIZES DE RESPOSTA:
- Sempre responda em português claro, direto e profissional de Engenheiro de Jogos Retro.
- Quando fornecer código Python, coloque-o dentro de blocos de código markdown com marcador \`\`\`python.
- Se o usuário pedir um jogo novo, forneça o código Python completo, executável e otimizado usando import game, definindo o setup inicial, as variáveis globais de estado do jogo e a função de atualização (update) registrada com game.loop(update).
- Os jogos criados devem ser visualmente refinados dentro das limitações de caracteres, usando blocos de preenchimento (como "■" ou "█") e elementos ASCII coloridos de forma criativa e harmoniosa.`;

export interface AssistantRequest {
  prompt: string;
  currentCode?: string;
  action?: 'custom' | 'explain' | 'fix' | 'add_feature' | 'new_game';
}

export interface AssistantResponse {
  success: boolean;
  reply?: string;
  extractedCode?: string;
  error?: string;
}

export async function handleAiRequest(body: AssistantRequest): Promise<AssistantResponse> {
  const { prompt, currentCode, action } = body;

  if (!prompt && !action) {
    return { success: false, error: 'Pergunta ou solicitação não fornecida.' };
  }

  const ai = getAiClient();

  let userMessage = prompt || '';
  if (action === 'explain') {
    userMessage = `Explique em detalhes como funciona o seguinte código Python de terminal MS-DOS, listando a lógica de estados e desenho:\n\`\`\`python\n${currentCode || ''}\n\`\`\``;
  } else if (action === 'fix') {
    userMessage = `Analise o código Python abaixo, identifique possíveis erros lógicos, de sintaxe ou de importação no loop de jogo do terminal, e forneça a versão corrigida completa e funcional:\n\`\`\`python\n${currentCode || ''}\n\`\`\`\nInstrução adicional: ${prompt || 'Corrija erros e deixe o jogo funcionando perfeitamente.'}`;
  } else if (action === 'add_feature') {
    userMessage = `Com base no código Python atual abaixo, implemente a seguinte funcionalidade de jogo: "${prompt}". Retorne o código atualizado completo:\n\`\`\`python\n${currentCode || ''}\n\`\`\``;
  } else if (action === 'new_game') {
    userMessage = `Crie um novo jogo completo em Python estilo terminal MS-DOS de acordo com o pedido: "${prompt}". O jogo deve ser divertido, ter tela inicializada com game.init(40, 25), arte em caracteres ASCII ou blocos Unicode, movimento de jogador, colisões simples, pontuação e som com game.beep(). Termine registrando o game loop via game.loop(update).`;
  } else if (currentCode && currentCode.trim().length > 0) {
    userMessage = `${prompt}\n\n[Código Python atual no editor]:\n\`\`\`python\n${currentCode}\n\`\`\``;
  }

  // Preferred models to try in order
  const models = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
  let lastError: Error | null = null;
  let replyText = '';

  for (const model of models) {
    try {
      const result = await ai.models.generateContent({
        model,
        contents: userMessage,
        config: {
          systemInstruction: BIT_SYSTEM_INSTRUCTION,
          temperature: 0.7,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      if (result.text) {
        replyText = result.text;
        break;
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    }
  }

  if (!replyText) {
    return {
      success: false,
      error: lastError ? `Erro ao consultar a IA: ${lastError.message}` : 'Não foi possível gerar resposta no momento.'
    };
  }

  // Extract .py or python code block if present
  let extractedCode = '';
  const pythonCodeRegex = /```(?:python)?\s*([\s\S]*?)```/i;
  const match = replyText.match(pythonCodeRegex);
  if (match && match[1]) {
    extractedCode = match[1].trim();
  }

  return {
    success: true,
    reply: replyText,
    extractedCode: extractedCode || undefined
  };
}
