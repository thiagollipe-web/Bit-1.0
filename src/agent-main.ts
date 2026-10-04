import { criarJogoBit } from './index.ts';
import { planProject, validateBit, type AgentTask } from './agent/bit-agent.ts';

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
const promptInput = document.querySelector<HTMLTextAreaElement>('#agent-prompt')!;
const codeEditor = document.querySelector<HTMLTextAreaElement>('#code-editor')!;
const taskList = document.querySelector<HTMLDivElement>('#task-list')!;
const logPanel = document.querySelector<HTMLDivElement>('#agent-log')!;
const status = document.querySelector<HTMLSpanElement>('#agent-status')!;
const progress = document.querySelector<HTMLDivElement>('#progress-bar')!;
const projectName = document.querySelector<HTMLHeadingElement>('#project-name')!;
const validation = document.querySelector<HTMLDivElement>('#validation')!;
let currentGame: ReturnType<typeof criarJogoBit>['game'] | null = null;
let tasks: AgentTask[] = [];

function log(message: string) {
  const line = document.createElement('div');
  line.textContent = '> ' + message;
  logPanel.prepend(line);
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((t) => {
    const row = document.createElement('div');
    row.className = 'task ' + t.status;
    row.innerHTML = '<span class="task-dot"></span><div><strong>' + t.title +
      '</strong><small>' + t.description + '</small></div><b>' +
      (t.status === 'done' ? 'OK' : t.status === 'running' ? '...' : t.status === 'error' ? 'ERR' : '—') + '</b>';
    taskList.appendChild(row);
  });
  const done = tasks.filter(t => t.status === 'done').length;
  progress.style.width = Math.round((done / Math.max(tasks.length, 1)) * 100) + '%';
}

function setCode(code: string) {
  codeEditor.value = code;
  localStorage.setItem('bit-agent-code', code);
}

function validate() {
  const result = validateBit(codeEditor.value);
  validation.className = 'validation ' + (result.ok ? 'ok' : 'error');
  validation.textContent = (result.ok ? '✓ ' : '✕ ') + result.message;
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

function executeAgent() {
  const prompt = promptInput.value.trim() || 'Crie um jogo 2D retro simples.';
  const plan = planProject(prompt);
  projectName.textContent = plan.title;
  tasks = plan.tasks;
  setCode(plan.code);
  validation.className = 'validation ' + (plan.validation.ok ? 'ok' : 'error');
  validation.textContent = (plan.validation.ok ? '✓ ' : '✕ ') + plan.validation.message;
  renderTasks();
  log('Objetivo: ' + prompt);
  log('Planejamento concluído.');
  run();
  setTimeout(() => {
    tasks = tasks.map(t => t.status === 'pending' ? { ...t, status: 'done' } : t);
    renderTasks();
    log('Projeto pronto para edição.');
  }, 450);
}

document.querySelector('#btn-generate')?.addEventListener('click', executeAgent);
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
document.querySelector('#btn-example')?.addEventListener('click', () => {
  promptInput.value = 'Crie um jogo de plataforma retro com inimigos.';
  executeAgent();
});

const saved = localStorage.getItem('bit-agent-code');
if (saved) {
  codeEditor.value = saved;
  validate();
  log('Projeto local restaurado.');
} else {
  executeAgent();
}
