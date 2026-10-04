import { criarJogoBit } from './index.ts';
import { planProject, validateBit, type AgentTask } from './agent/bit-agent.ts';
import { SymbolicEngine, type SymbolicResult } from './agent/symbolic-engine.ts';

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
const promptInput = document.querySelector<HTMLTextAreaElement>('#agent-prompt')!;
const codeEditor = document.querySelector<HTMLTextAreaElement>('#code-editor')!;
const taskList = document.querySelector<HTMLDivElement>('#task-list')!;
const logPanel = document.querySelector<HTMLDivElement>('#agent-log')!;
const status = document.querySelector<HTMLSpanElement>('#agent-status')!;
const progress = document.querySelector<HTMLDivElement>('#progress-bar')!;
const projectName = document.querySelector<HTMLHeadingElement>('#project-name')!;
const validation = document.querySelector<HTMLDivElement>('#validation')!;
const chatLog = document.querySelector<HTMLDivElement>('#chat-log')!;
const chatInput = document.querySelector<HTMLInputElement>('#chat-input')!;
const symbolicIntent = document.querySelector<HTMLDivElement>('#symbolic-intent')!;
const symbolicConfidence = document.querySelector<HTMLDivElement>('#symbolic-confidence')!;
const symbolicEntities = document.querySelector<HTMLDivElement>('#symbolic-entities')!;
const symbolicTrace = document.querySelector<HTMLDivElement>('#symbolic-trace')!;
const memoryFacts = document.querySelector<HTMLElement>('#memory-facts')!;
const memoryEdges = document.querySelector<HTMLElement>('#memory-edges')!;
const contextTopic = document.querySelector<HTMLElement>('#context-topic')!;
const contextStage = document.querySelector<HTMLElement>('#context-stage')!;
const contextPending = document.querySelector<HTMLElement>('#context-pending')!;
const knowledgeFile = document.querySelector<HTMLInputElement>('#knowledge-file')!;
async function askBackend(prompt: string) {
  const response = await fetch('https://bit-1-0-git-main-dev-ai3.vercel.app/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, currentCode: codeEditor.value })
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'Falha no backend de IA.');
  return data.reply as string;
}

let currentGame: ReturnType<typeof criarJogoBit>['game'] | null = null;
let tasks: AgentTask[] = [];
const engine = new SymbolicEngine();

function log(message: string) {
  const line = document.createElement('div');
  line.textContent = '> ' + message;
  logPanel.prepend(line);
}

function chat(role: 'user' | 'bot' | 'system', message: string) {
  const bubble = document.createElement('div');
  bubble.className = 'msg ' + role;
  bubble.textContent = message;
  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function renderSymbolic(result: SymbolicResult) {
  symbolicIntent.textContent = 'Intenção: ' + result.intent.intent;
  symbolicConfidence.textContent = 'Confiança: ' + Math.round(result.intent.confidence * 100) + '%';
  symbolicEntities.textContent = 'Entidades: ' + (result.intent.entities.length ? result.intent.entities.join(', ') : 'nenhuma');
  symbolicTrace.innerHTML = '';
  result.trace.forEach(item => {
    const line = document.createElement('span');
    line.textContent = '→ ' + item;
    symbolicTrace.appendChild(line);
  });

  memoryFacts.textContent = String(result.memory.facts);
  memoryEdges.textContent = String(result.memory.edges);
  contextTopic.textContent = engine.context.assunto || '—';
  contextStage.textContent = engine.context.etapa || '—';
  contextPending.textContent = engine.context.pendencia || '—';
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((t) => {
    const row = document.createElement('div');
    row.className = 'task ' + t.status;

    const dot = document.createElement('span');
    dot.className = 'task-dot';
    const body = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = t.title;
    const small = document.createElement('small');
    small.textContent = t.description;
    body.append(strong, small);
    const badge = document.createElement('b');
    badge.textContent = t.status === 'done' ? 'OK' : t.status === 'running' ? '...' : t.status === 'error' ? 'ERR' : '—';

    row.append(dot, body, badge);
    taskList.appendChild(row);
  });

  const done = tasks.filter(t => t.status === 'done').length;
  progress.style.width = Math.round((done / Math.max(tasks.length, 1)) * 100) + '%';
}

function setCode(code: string) {
  codeEditor.value = code;
  localStorage.setItem('bit-agent-code', code);
}

function showValidation(result: { ok: boolean; message: string }) {
  validation.className = 'validation ' + (result.ok ? 'ok' : 'error');
  validation.textContent = (result.ok ? '✓ ' : '✕ ') + result.message;
}

function validate() {
  const result = validateBit(codeEditor.value);
  showValidation(result);
  return result.ok;
}

function run() {
  if (currentGame) currentGame.stop();
  if (!validate()) {
    status.textContent = 'ERRO';
    log('Validação falhou.');
    return;
  }

  try {
    const built = criarJogoBit(codeEditor.value, canvas);
    currentGame = built.game;
    currentGame.start();
    status.textContent = 'EXECUTANDO';
    log('Runtime Bit iniciado.');
  } catch (error) {
    status.textContent = 'ERRO';
    log('Falha no runtime: ' + (error instanceof Error ? error.message : String(error)));
  }
}

function executePlan(prompt: string) {
  const plan = planProject(prompt, codeEditor.value, engine);
  projectName.textContent = plan.title;
  tasks = plan.tasks;
  setCode(plan.code);
  showValidation(plan.validation);

  if (plan.symbolic) {
    symbolicIntent.textContent = 'Intenção: ' + plan.symbolic.intent;
    symbolicConfidence.textContent = 'Confiança: ' + Math.round(plan.symbolic.confidence * 100) + '%';
    symbolicEntities.textContent = 'Entidades: ' + (plan.symbolic.entities.length ? plan.symbolic.entities.join(', ') : 'nenhuma');
    symbolicTrace.innerHTML = '';
    plan.symbolic.trace.forEach(item => {
      const line = document.createElement('span');
      line.textContent = '→ ' + item;
      symbolicTrace.appendChild(line);
    });
  }

  renderTasks();
  log('Tarefa recebida: ' + prompt);
  log(plan.summary);
  run();

  setTimeout(() => {
    tasks = tasks.map(t => t.status === 'pending' ? { ...t, status: 'done' } : t);
    renderTasks();
    log('Plano concluído.');
  }, 350);
}

function handleChat() {
  const text = chatInput.value.trim();
  if (!text) return;

  chatInput.value = '';
  chat('user', text);
  const result = engine.handle(text);
  renderSymbolic(result);
  chat('bot', result.reply);
  log('Simbólico: ' + result.intent.intent + ' (' + Math.round(result.intent.confidence * 100) + '%)');

  const isProject = result.intent.intent === 'criar_jogo' || result.intent.intent === 'alterar_projeto';
  if (isProject) executePlan(text);

  // O chat é generativo por padrão. O motor simbólico continua fornecendo
  // memória/contexto, mas não bloqueia perguntas que ele não reconheça.
  chat('system', 'Consultando a IA...');
  askBackend(text)
    .then(reply => {
      chat('bot', reply);
      log('Resposta da IA recebida.');
    })
    .catch(error => {
      const message = error instanceof Error ? error.message : String(error);
      chat('system', 'Não foi possível obter resposta da IA: ' + message);
      log('Falha na IA generativa: ' + message);
    });
}

document.querySelector('#chat-send')?.addEventListener('click', handleChat);
chatInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleChat();
  }
});

document.querySelectorAll<HTMLButtonElement>('[data-chat]').forEach(button => {
  button.addEventListener('click', () => {
    chatInput.value = button.dataset.chat || '';
    handleChat();
  });
});

document.querySelector('#btn-generate')?.addEventListener('click', () => {
  const prompt = promptInput.value.trim() || 'Crie um jogo 2D retro simples.';
  executePlan(prompt);
});

document.querySelector('#btn-run')?.addEventListener('click', run);

document.querySelector('#btn-stop')?.addEventListener('click', () => {
  currentGame?.stop();
  status.textContent = 'PARADO';
  log('Runtime parado.');
});

document.querySelector('#btn-validate')?.addEventListener('click', () => {
  validate();
  log(validation.textContent || 'Validação concluída.');
});

document.querySelector('#btn-save')?.addEventListener('click', () => {
  localStorage.setItem('bit-agent-code', codeEditor.value);
  log('Projeto salvo localmente.');
});

document.querySelector('#btn-export')?.addEventListener('click', () => {
  const blob = new Blob([codeEditor.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'projeto.bit';
  a.click();
  URL.revokeObjectURL(url);
  log('Arquivo projeto.bit exportado.');
});

document.querySelector('#btn-export-knowledge')?.addEventListener('click', () => {
  const blob = new Blob([engine.exportKnowledge()], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bit-agent-conhecimento.json';
  a.click();
  URL.revokeObjectURL(url);
  log('Conhecimento exportado em JSON.');
});

document.querySelector('#btn-import-knowledge')?.addEventListener('click', () => knowledgeFile.click());

knowledgeFile.addEventListener('change', async () => {
  const file = knowledgeFile.files?.[0];
  if (!file) return;
  try {
    const imported = engine.importKnowledge(await file.text());
    renderSymbolic({
      reply: 'Conhecimento importado.',
      intent: { intent: 'comando', confidence: 1, entities: [], features: [] },
      trace: [`fatos importados = ${imported}`],
      changed: imported > 0,
      memory: { facts: engine.memory.facts.length, edges: engine.graph.edges.length }
    });
    chat('system', `Importação concluída: ${imported} fato(s).`);
    log('Conhecimento importado.');
  } catch (error) {
    chat('system', 'Falha ao importar JSON: ' + (error instanceof Error ? error.message : String(error)));
    log('Falha na importação de conhecimento.');
  } finally {
    knowledgeFile.value = '';
  }
});

const saved = localStorage.getItem('bit-agent-code');
if (saved) {
  codeEditor.value = saved;
  validate();
  log('Projeto local restaurado.');
  chat('system', 'Memória simbólica restaurada. O agente está pronto.');
} else {
  chat('system', 'Motor simbólico ativo. Experimente “Meu cachorro se chama Thor” ou “Crie um jogo de plataforma retro”.');
  executePlan('Crie um jogo 2D retro simples.');
}

renderSymbolic({
  reply: '',
  intent: { intent: 'conversa', confidence: 1, entities: [], features: [] },
  trace: ['motor simbólico carregado'],
  changed: false,
  memory: { facts: engine.memory.facts.length, edges: engine.graph.edges.length }
});
