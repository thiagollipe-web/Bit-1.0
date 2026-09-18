import { GoogleGenAI, ThinkingLevel } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Chave GEMINI_API_KEY não configurada no ambiente.');
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'microconda-studio' } }
    });
  }
  return aiClient;
}

const MICROCONDA_SYSTEM_INSTRUCTION = `Você é o assistente oficial da linguagem MicroConda, uma linguagem educacional em português para criação de jogos 2D.
Nunca gere Python, JavaScript ou outra linguagem quando o usuário pedir código MicroConda.
Use somente a sintaxe documentada no projeto.

Sintaxe principal:
- tela 160x120
- fundo preto
- variáveis: pontos recebe 0 ou pontos = 0
- ator Nome ... fim
- desenho quadrado TAM, COR
- desenho retangulo L, A, COR
- desenho circulo RAIO, COR
- desenho texto TAM, "texto", COR
- posição X, Y
- velocidade VX, VY
- controlado por setas|toque|mouse
- limita à tela
- quica nas bordas|verticais|horizontais
- se CONDIÇÃO então ... senão ... fim
- repita N vezes ... fim
- enquanto CONDIÇÃO faça ... fim
- função nome(args) ... fim
- retorne EXPRESSÃO
- diga EXPRESSÃO
- vira EXPRESSÃO
- quando atualiza: ... fim
- quando colide com "Nome": ... fim
- propriedades: x, y, vx, vy, largura, altura, ativo, cor, texto, angulo, alfa
- built-ins: aleatorio, distancia, colide, tecla, toque, seno, cosseno, raiz, absoluto, piso, teto, arredonda, tempo, limitar, interpolar, potencia, angulo, mouse_x, mouse_y, mouse_pressionado, para_texto, para_numero, gravar, salvar, carregar, tocar_som, som, bip.

Regras:
1. Ao criar jogo, devolva código MicroConda completo.
2. Não invente APIs.
3. Ao corrigir código, devolva MicroConda, nunca Python.
4. Explique erros usando linha e coluna sempre que disponíveis.
5. Prefira soluções pequenas e didáticas.`;

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

function buildUserMessage(body: AssistantRequest): string {
  const prompt = body.prompt?.trim() || 'Ajude a programar em MicroConda.';
  const code = body.currentCode?.trim() || '';
  const context = code ? `\n\n[Código MicroConda atual]:\n```bit\n${code}\n```` : '';

  switch (body.action) {
    case 'explain':
      return `Explique didaticamente este código MicroConda, sem convertê-lo para outra linguagem:${context}`;
    case 'fix':
      return `Corrija este código MicroConda e devolva o programa MicroConda completo. Pedido adicional: ${prompt}${context}`;
    case 'add_feature':
      return `Adicione esta funcionalidade ao código MicroConda atual e devolva o programa completo: ${prompt}${context}`;
    case 'new_game':
      return `Crie um jogo completo em MicroConda para o pedido: ${prompt}. Inclua cenário, ator controlável, objetivo e feedback ao jogador.`;
    default:
      return `${prompt}${context}`;
  }
}

export async function handleAiRequest(body: AssistantRequest): Promise<AssistantResponse> {
  if (!body?.prompt && !body?.action) {
    return { success: false, error: 'Pergunta ou solicitação não fornecida.' };
  }

  try {
    const ai = getAiClient();
    const result = await ai.models.generateContent({
      model: process.env.MICROCONDA_AI_MODEL || 'gemini-flash-latest',
      contents: buildUserMessage(body),
      config: {
        systemInstruction: MICROCONDA_SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });

    const reply = result.text?.trim() || '';
    if (!reply) return { success: false, error: 'A IA não retornou conteúdo.' };

    const match = reply.match(/```(?:bit)?\s*([\s\S]*?)```/i);
    return {
      success: true,
      reply,
      extractedCode: match?.[1]?.trim() || undefined
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Erro ao consultar a IA: ${message}` };
  }
}
