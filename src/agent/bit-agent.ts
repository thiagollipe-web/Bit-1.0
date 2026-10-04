import { parse } from '../parser.ts';
import { tokenize } from '../lexer.ts';
import { SymbolicEngine } from './symbolic-engine.ts';

export type AgentTaskStatus = 'pending' | 'running' | 'done' | 'error';

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  status: AgentTaskStatus;
}

export interface AgentPlan {
  title: string;
  summary: string;
  tasks: AgentTask[];
  code: string;
  validation: { ok: boolean; message: string };
  symbolic?: {
    intent: string;
    confidence: number;
    entities: string[];
    trace: string[];
  };
}

function task(title: string, description: string, id: string): AgentTask {
  return { id, title, description, status: 'pending' };
}

const BASIC = `tela 320x180
fundo preto

pontos recebe 0

ator Jogador
  desenho quadrado 12, verde
  posição 150, 80
  controlado por setas
  limita à tela
fim

ator Alvo
  desenho circulo 10, amarelo
  posição 240, 80
fim`;

const PONG = `tela 320x180
fundo preto

ator Jogador
  desenho retangulo 8, 40, branco
  posição 20, 70
  controlado por setas
  limita à tela
fim

ator Bola
  desenho quadrado 8, branco
  posição 156, 86
  velocidade 2, 1
  quica nas bordas
fim

ator Oponente
  desenho retangulo 8, 40, verde
  posição 292, 70
fim`;

const SHOOTER = `tela 320x180
fundo preto

pontos recebe 0

ator Nave
  desenho triangulo 12, 12, ciano
  posição 150, 150
  controlado por setas
  limita à tela
fim

ator Inimigo
  desenho quadrado 12, vermelho
  posição 150, 30
  velocidade 1, 0
fim`;

const PLATFORM = `tela 320x180
fundo azul

ator Jogador
  desenho quadrado 10, amarelo
  posição 40, 140
  velocidade 0, 0
  controlado por setas
  limita à tela
fim

ator Plataforma
  desenho retangulo 220, 12, verde
  posição 50, 160
fim

ator Inimigo
  desenho quadrado 10, vermelho
  posição 230, 140
  velocidade -1, 0
fim`;

function applySimpleEdit(prompt: string, code: string): { code: string; message: string } {
  const n = prompt.toLowerCase();
  let result = code;

  if (/\b(moeda|coin)\b/.test(n) && !/ator\s+moeda/i.test(result)) {
    result += `\n\nator Moeda
  desenho circulo 6, amarelo
  posição 200, 100
fim`;
    return { code: result, message: 'Adicionei uma moeda ao projeto.' };
  }

  if (/\b(inimigo|inimigos)\b/.test(n) && !/ator\s+Inimigo/i.test(result)) {
    result += `\n\nator Inimigo
  desenho quadrado 10, vermelho
  posição 240, 120
fim`;
    return { code: result, message: 'Adicionei um inimigo ao projeto.' };
  }

  const color = n.match(/\b(preto|branco|verde|vermelho|azul|amarelo|ciano|magenta)\b/);
  if (color && /\bfundo\b/.test(n)) {
    result = result.replace(/^fundo\s+[^\n]+/im, `fundo ${color[1]}`);
    return { code: result, message: `Troquei o fundo para ${color[1]}.` };
  }

  if (/\bpontua(c|ç)ao\b|\bpontos\b/.test(n) && !/^pontos\s+recebe/im.test(result)) {
    result = `pontos recebe 0\n\n` + result;
    return { code: result, message: 'Adicionei a variável de pontuação.' };
  }

  return { code, message: 'A intenção foi reconhecida, mas ainda não existe uma transformação simbólica pronta para esse pedido.' };
}

export function validateBit(code: string): { ok: boolean; message: string } {
  try {
    parse(tokenize(code));
    return { ok: true, message: 'Código Bit válido.' };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

export function planProject(prompt: string, currentCode = '', engine = new SymbolicEngine()): AgentPlan {
  const analysis = engine.classify(prompt);
  const p = prompt.toLowerCase();
  let code = currentCode;
  let title = 'Novo projeto Bit';
  let summary = 'Protótipo inicial criado pelo Agente Bit.';

  if (currentCode.trim() && analysis.intent === 'alterar_projeto') {
    const edit = applySimpleEdit(prompt, currentCode);
    code = edit.code;
    title = 'Projeto Bit — alteração simbólica';
    summary = edit.message;
  } else if (/(pong|ping.?pong)/.test(p)) {
    code = PONG;
    title = 'Pong Bit';
    summary = 'Protótipo de Pong com jogadores, bola e movimento.';
  } else if (/(tiro|shooter|nave|space|alien)/.test(p)) {
    code = SHOOTER;
    title = 'Shooter Bit';
    summary = 'Base de jogo de nave com inimigo, controles e pontuação.';
  } else if (/(plataforma|platform|mario|pular|aventura)/.test(p)) {
    code = PLATFORM;
    title = 'Plataforma Bit';
    summary = 'Base de plataforma com jogador, cenário e inimigo.';
  } else if (!currentCode.trim()) {
    code = BASIC;
    if (prompt.trim()) {
      title = prompt.trim().slice(0, 42);
      summary = 'Base gerada após análise simbólica da solicitação.';
    }
  }

  const tasks: AgentTask[] = [
    task('Interpretar intenção', 'Classificar a solicitação, extrair entidades e reconhecer o contexto.', 'T01'),
    task('Consultar conhecimento', 'Verificar memória, fatos, grafo, sinônimos e regras relevantes.', 'T02'),
    task('Planejar alteração', 'Transformar a intenção em uma ação concreta do agente.', 'T03'),
    task('Gerar código Bit', 'Produzir ou transformar código usando a gramática do Bit.', 'T04'),
    task('Validar sintaxe', 'Executar lexer e parser antes do runtime.', 'T05'),
    task('Preparar preview', 'Compilar o AST e iniciar o Canvas.', 'T06')
  ];

  const validation = validateBit(code);
  for (let i = 0; i < tasks.length; i++) {
    tasks[i].status = validation.ok && i < 5 ? 'done' : validation.ok ? 'pending' : (i === 4 ? 'error' : 'done');
  }

  return {
    title,
    summary,
    tasks,
    code,
    validation,
    symbolic: {
      intent: analysis.intent,
      confidence: analysis.confidence,
      entities: analysis.entities,
      trace: [
        `intenção reconhecida: ${analysis.intent} (${Math.round(analysis.confidence * 100)}%)`,
        analysis.entities.length ? 'entidades: ' + analysis.entities.join(', ') : 'entidades: nenhuma explícita',
        ...analysis.features.map(feature => 'sinal: ' + feature)
      ]
    }
  };
}
