import { parse } from '../parser.ts';
import { tokenize } from '../lexer.ts';

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
fim

ator Nave
  quando atualiza:
    se tecla("direita") então
      x recebe x + 2
    fim
    se tecla("esquerda") então
      x recebe x - 2
    fim
  fim
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

export function validateBit(code: string): { ok: boolean; message: string } {
  try {
    parse(tokenize(code));
    return { ok: true, message: 'Código Bit válido.' };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

export function planProject(prompt: string): AgentPlan {
  const p = prompt.toLowerCase();
  let code = BASIC;
  let title = 'Novo projeto Bit';
  let summary = 'Protótipo inicial criado pelo Agente Bit.';

  if (/(pong|ping.?pong)/.test(p)) {
    code = PONG;
    title = 'Pong Bit';
    summary = 'Protótipo de Pong com jogadores, bola e colisão preparada.';
  } else if (/(tiro|shooter|nave|space|alien)/.test(p)) {
    code = SHOOTER;
    title = 'Shooter Bit';
    summary = 'Base de jogo de nave com inimigo, controles e pontuação.';
  } else if (/(plataforma|platform|mario|pular|aventura)/.test(p)) {
    code = PLATFORM;
    title = 'Plataforma Bit';
    summary = 'Base de plataforma com jogador, cenário e inimigo.';
  } else if (prompt.trim()) {
    title = prompt.trim().slice(0, 42);
    summary = 'Base gerada a partir da solicitação. Continue a evolução no editor.';
  }

  const tasks: AgentTask[] = [
    task('Entender objetivo', 'Interpretar a ideia do jogo e selecionar as mecânicas.', 'T01'),
    task('Planejar arquitetura', 'Escolher tela, atores, controles, física e eventos.', 'T02'),
    task('Gerar código Bit', 'Produzir código usando a gramática do Bit.', 'T03'),
    task('Validar sintaxe', 'Executar lexer e parser antes do runtime.', 'T04'),
    task('Preparar preview', 'Compilar o AST e iniciar o Canvas.', 'T05')
  ];

  const validation = validateBit(code);
  for (let i = 0; i < 4; i++) tasks[i].status = validation.ok ? 'done' : (i === 3 ? 'error' : 'done');

  return { title, summary, tasks, code, validation };
}
