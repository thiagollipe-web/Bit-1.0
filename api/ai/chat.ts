export interface ChatRequest {
  provider?: 'ollama' | 'maritaca';
  model?: string;
  messages?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  prompt?: string;
  currentCode?: string;
}

const SYSTEM = `Você é o THIGAS AI integrado ao Bit Agent.
Você é um agente de programação especializado na linguagem Bit, uma linguagem textual brasileira para jogos 2D.
Responda em português do Brasil, de forma direta e útil.
Quando o usuário estiver perguntando sobre programação ou sobre o projeto Bit, preserve a linguagem Bit e não substitua Bit por Python ou JavaScript.
Você pode explicar conceitos, analisar código, corrigir problemas e propor alterações.
Se receber código Bit, trate-o como código real do projeto.
Nunca revele chaves de API, variáveis de ambiente ou detalhes secretos do backend.`;

function json(res: any, status: number, data: unknown, origin = '*') {
  res.status(status).setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  return res.json(data);
}

function messagesFor(body: ChatRequest) {
  const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
  if (!messages.length && body.prompt) messages.push({ role: 'user', content: body.prompt });
  if (body.currentCode) {
    messages.push({
      role: 'user',
      content: 'Código Bit atual para contexto:\n\n' + body.currentCode
    });
  }
  return [{ role: 'system' as const, content: SYSTEM }, ...messages];
}

async function callMaritaca(messages: Array<{role: string; content: string}>, model: string) {
  const key = process.env.MARITACA_API_KEY;
  if (!key) throw new Error('MARITACA_API_KEY não configurada no backend.');
  const response = await fetch('https://chat.maritaca.ai/api/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: 4000 })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Maritaca HTTP ${response.status}`);
  return data?.choices?.[0]?.message?.content || '';
}

async function callOllama(messages: Array<{role: string; content: string}>, model: string) {
  const key = process.env.OLLAMA_API_KEY;
  if (!key) throw new Error('OLLAMA_API_KEY não configurada no backend.');
  const base = (process.env.OLLAMA_BASE_URL || 'https://ollama.com/v1').replace(/\/$/, '');
  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: 4000 })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Ollama HTTP ${response.status}`);
  return data?.choices?.[0]?.message?.content || '';
}

export default async function handler(req: any, res: any) {
  const origin = req.headers.origin || '*';
  if (req.method === 'OPTIONS') return json(res, 204, {}, origin);
  if (req.method !== 'POST') return json(res, 405, { success: false, error: 'Método não permitido.' }, origin);

  try {
    const body = (req.body || {}) as ChatRequest;
    // A interface não escolhe mais o provedor. O backend decide automaticamente.
    const configured = (process.env.AI_PROVIDER || 'auto').toLowerCase();
    const hasMaritaca = Boolean(process.env.MARITACA_API_KEY);
    const hasOllama = Boolean(process.env.OLLAMA_API_KEY);
    let provider: 'ollama' | 'maritaca';
    if (configured === 'ollama' && hasOllama) provider = 'ollama';
    else if (configured === 'maritaca' && hasMaritaca) provider = 'maritaca';
    else if (hasMaritaca) provider = 'maritaca';
    else if (hasOllama) provider = 'ollama';
    else throw new Error('Nenhum provedor de IA configurado. Configure MARITACA_API_KEY ou OLLAMA_API_KEY na Vercel.');
    const requestedModel = typeof body.model === 'string' ? body.model.trim() : '';
    const model = requestedModel || (provider === 'ollama'
      ? (process.env.OLLAMA_MODEL || 'llama3.2')
      : (process.env.MARITACA_MODEL || 'sabia-4'));
    const messages = messagesFor(body);
    if (messages.length < 2) return json(res, 400, { success: false, error: 'Envie uma pergunta.' }, origin);

    const reply = provider === 'ollama'
      ? await callOllama(messages, model)
      : await callMaritaca(messages, model);

    return json(res, 200, { success: true, provider, model, reply });
  } catch (error) {
    return json(res, 500, {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, origin);
  }
}
