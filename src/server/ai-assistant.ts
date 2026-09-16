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

const BIT_SYSTEM_INSTRUCTION = `Você é o assistente de programação especialista na linguagem BIT 1.2 (uma linguagem textual brasileira para criação de jogos 2D).
Sua missão é ajudar o desenvolvedor a criar, corrigir, otimizar e entender programas e jogos escritos em BIT (.bit).

REGRAS SINTÁTICAS E GRAMATICAIS DA LINGUAGEM BIT 1.2:
1. Dimensão da tela:
   tela 160x120
   fundo preto (cores válidas: preto, branco, vermelho, verde, azul, amarelo, ciano, magenta, cinza, laranja, roxo, rosa, marrom, invisivel)

2. Declaração de Variáveis:
   pontos recebe 0
   # ou: pontos = 0

3. Declaração de Atores:
   ator NomeDoAtor
     desenho quadrado 8, verde
     # ou: desenho retângulo 16, 6, azul
     # ou: desenho circulo 5, amarelo
     # ou: desenho texto 10, "Texto", branco
     posição 76, 56
     velocidade 1.5, 2.0
     controlado por setas
     limita à tela
     quica nas bordas
     quando atualiza:
       # código a cada quadro
     fim
     quando colide com "OutroAtor":
       # código executado ao colidir
     fim
   fim

4. Estruturas de Controle:
   se condição então
     # comandos
   senão se outra_condição então
     # comandos
   senão
     # comandos
   fim

   repita 5 vezes
     # comandos
   fim

   enquanto condição faça
     # comandos
   fim

5. Funções:
   função somar(a, b)
     retorne a + b
   fim

6. Mensagens no Console:
   diga "Mensagem aqui"
   diga "Pontos: " + pontos

7. Funções Embutidas (Built-ins):
   - aleatorio(min, max): número aleatório entre min e max
   - distancia(x1, y1, x2, y2): distância euclidiana entre dois pontos
   - tecla("arrowup"), tecla("arrowdown"), tecla("arrowleft"), tecla("arrowright"), tecla("espaco"), tecla("a"), tecla("w"), etc.
   - tempo(): tempo decorrido em segundos
   - seno(graus), cosseno(graus), raiz(val), absoluto(val), arredonda(val), piso(val), teto(val)

8. Propriedades de Atores:
   Dentro do próprio ator: x, y, vx, vy, largura, altura, ativo.
   Acessando outro ator: NomeDoAtor.x, NomeDoAtor.y, etc.

DIRETRIZES DE RESPOSTA:
- Sempre responda em português claro e amigável.
- Quando fornecer código BIT, coloque-o dentro de blocos de código markdown com marcador \`\`\`bit.
- Certifique-se de que TODO código .bit gerado siga rigorosamente a sintaxe acima (termine blocos com 'fim', use 'se ... então', 'quando atualiza:', etc.).
- Se o usuário pedir um jogo novo, forneça o código completo e executável.
- Se o usuário pedir para corrigir ou adicionar uma funcionalidade, explique brevemente a alteração e mostre o código pronto.`;

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
    userMessage = `Explique em detalhes como funciona o seguinte código BIT, quais são os atores e qual a lógica de jogo:\n\`\`\`bit\n${currentCode || ''}\n\`\`\``;
  } else if (action === 'fix') {
    userMessage = `Analise o código BIT abaixo, identifique possíveis erros sintáticos ou lógicos de colisão/movimento, e forneça a versão corrigida completa e funcional:\n\`\`\`bit\n${currentCode || ''}\n\`\`\`\nInstrução adicional: ${prompt || 'Corrija erros e deixe o jogo funcionando perfeitamente.'}`;
  } else if (action === 'add_feature') {
    userMessage = `Com base no código BIT atual abaixo, implemente a seguinte funcionalidade: "${prompt}". Retorne o código atualizado completo:\n\`\`\`bit\n${currentCode || ''}\n\`\`\``;
  } else if (action === 'new_game') {
    userMessage = `Crie um novo jogo 2D completo na linguagem BIT de acordo com o pedido: "${prompt}". O jogo deve ser divertido, ter tela 160x120, atores com desenhos coloridos, movimento, colisões e pontuação ou objetivo claro.`;
  } else if (currentCode && currentCode.trim().length > 0) {
    userMessage = `${prompt}\n\n[Código BIT atual no editor]:\n\`\`\`bit\n${currentCode}\n\`\`\``;
  }

  // Preferred models to try in order
  const models = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
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
      // Try next model if available
      continue;
    }
  }

  if (!replyText) {
    return {
      success: false,
      error: lastError ? `Erro ao consultar a IA: ${lastError.message}` : 'Não foi possível gerar resposta no momento.'
    };
  }

  // Extract .bit code block if present
  let extractedCode = '';
  const bitCodeRegex = /```(?:bit)?\s*([\s\S]*?)```/i;
  const match = replyText.match(bitCodeRegex);
  if (match && match[1]) {
    extractedCode = match[1].trim();
  }

  return {
    success: true,
    reply: replyText,
    extractedCode: extractedCode || undefined
  };
}
