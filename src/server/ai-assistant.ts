import { GoogleGenAI, ThinkingLevel } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY não configurada.');
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const BIT_SYSTEM_INSTRUCTION = 'Você é o Agente Bit, especialista na linguagem Bit para criação de jogos 2D. Responda em português. A linguagem usa tela 320x180, fundo preto, ator Nome, desenho quadrado 10, verde, posição 40, 80, velocidade 1, 0, controlado por setas, limita à tela, fim. Eventos usam quando atualiza: e quando colide com "Nome":. Condições usam se ... então ... fim. Atribuição aceita recebe ou =. Seu objetivo é planejar, escrever, explicar, corrigir e revisar projetos Bit. Nunca substitua Bit por Python ou JavaScript.';

export interface AssistantRequest {
  prompt: string;
  currentCode?: string;
  action?: 'custom' | 'explain' | 'fix' | 'add_feature' | 'new_game';
}

export async function handleAiRequest(body: AssistantRequest) {
  const { prompt, currentCode, action } = body;
  if (!prompt && !currentCode) return { success: false, error: 'Solicitação vazia.' };
  const ai = getAiClient();
  const task = action === 'fix' ? 'Corrija o código Bit e devolva a versão completa.' :
    action === 'explain' ? 'Explique a lógica do código Bit.' :
    action === 'add_feature' ? 'Adicione a funcionalidade solicitada e devolva o código completo.' :
    'Crie ou transforme o projeto Bit conforme a solicitação.';
  const context = currentCode ? '\nCódigo Bit atual:\n' + currentCode : '';
  const result = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: task + '\nSolicitação: ' + (prompt || 'Analise o projeto.') + context,
    config: { systemInstruction: BIT_SYSTEM_INSTRUCTION, thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
  });
  return { success: true, reply: result.text || '' };
}
