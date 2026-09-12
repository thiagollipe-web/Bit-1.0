import { tokenize } from './lexer.ts';
import { parse } from './parser.ts';
import { Game } from './runtime/game.ts';

const EXAMPLES: Record<string, string> = {
  pong: `tela 160x120
fundo preto

pontos1 recebe 0
pontos2 recebe 0

ator Jogador1
  desenho retângulo 4, 24, branco
  posição 8, 48
  controlado por setas
  limita à tela
fim

ator Jogador2
  desenho retângulo 4, 24, branco
  posição 148, 48
  limita à tela
  quando atualiza:
    se Bola.y > y então
      y recebe y + 1.2
    senão se Bola.y < y então
      y recebe y - 1.2
    fim
  fim
fim

ator Bola
  desenho quadrado 4, branco
  posição 78, 58
  velocidade 2, 1.5
  quica nas bordas verticais
  quando atualiza:
    se x < 0 então
      pontos2 recebe pontos2 + 1
      x recebe 78
      y recebe 58
      vx recebe 2
      diga "Ponto Jogador 2!"
    senão se x > 160 então
      pontos1 recebe pontos1 + 1
      x recebe 78
      y recebe 58
      vx recebe -2
      diga "Ponto Jogador 1!"
    fim
  fim
  quando colide com "Jogador1":
    vx recebe 2.2
  fim
  quando colide com "Jogador2":
    vx recebe -2.2
  fim
fim`,

  nave: `tela 160x120
fundo preto

pontos recebe 0

ator Nave
  desenho retângulo 12, 8, verde
  posição 74, 100
  controlado por setas
  limita à tela
  quando atualiza:
    se tecla("espaco") então
      diga "Laser disparado!"
    fim
  fim
fim

ator Inimigo
  desenho quadrado 8, vermelho
  posição 76, 10
  velocidade 1, 0.6
  quica nas bordas horizontais
  quando atualiza:
    se y > 120 então
      y recebe 0
      x recebe aleatorio(10, 140)
    fim
  fim
  quando colide com "Nave":
    diga "Alerta de colisão!"
  fim
fim

ator Estrela
  desenho quadrado 2, amarelo
  posição 80, 20
  velocidade 0, 1
  quando atualiza:
    se y > 120 então
      y recebe 0
      x recebe aleatorio(0, 160)
    fim
  fim
fim`,

  breakout: `tela 160x120
fundo preto

pontos recebe 0

ator Paleta
  desenho retângulo 20, 4, azul
  posição 70, 110
  controlado por setas
  limita à tela
fim

ator Bola
  desenho quadrado 4, branco
  posição 78, 60
  velocidade 1.5, -2
  quica nas bordas
  quando colide com "Paleta":
    vy recebe -2
  fim
  quando colide com "Bloco1":
    vy recebe 2
    pontos recebe pontos + 10
    diga "Bloco 1 destruído!"
  fim
  quando colide com "Bloco2":
    vy recebe 2
    pontos recebe pontos + 10
    diga "Bloco 2 destruído!"
  fim
fim

ator Bloco1
  desenho retângulo 16, 6, vermelho
  posição 40, 20
fim

ator Bloco2
  desenho retângulo 16, 6, amarelo
  posição 80, 20
fim`,

  senao_se: `tela 160x120
fundo azul

valor recebe aleatorio(1, 3)

se valor == 1 então
  diga "Ramo 1: valor é um"
senão se valor == 2 então
  diga "Ramo 2: valor é dois"
senão se valor == 3 então
  diga "Ramo 3: valor é três"
senão
  diga "Ramo senão: outro valor"
fim

ator Cubo
  desenho quadrado 12, amarelo
  posição 74, 54
  quica nas bordas
  velocidade 1, 1
fim`
};

let currentGame: Game | null = null;

const editor = document.getElementById('code-editor') as HTMLTextAreaElement;
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const consoleOutput = document.getElementById('console-output') as HTMLDivElement;
const btnRun = document.getElementById('btn-run') as HTMLButtonElement;
const btnStop = document.getElementById('btn-stop') as HTMLButtonElement;
const exampleSelect = document.getElementById('example-select') as HTMLSelectElement;

function log(msg: string, isError = false) {
  const el = document.createElement('div');
  el.className = isError ? 'log-entry log-error' : 'log-entry';
  el.textContent = msg;
  consoleOutput.appendChild(el);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function stopCurrentGame() {
  if (currentGame) {
    currentGame.stop();
    currentGame = null;
  }
}

function runCode() {
  stopCurrentGame();
  consoleOutput.innerHTML = '';
  const code = editor.value;

  try {
    const tokens = tokenize(code);
    const ast = parse(tokens);

    canvas.width = ast.screenWidth;
    canvas.height = ast.screenHeight;

    currentGame = new Game(ast, canvas);
    currentGame.interpreter.onSay = (msg) => {
      log(`> ${msg}`);
    };

    currentGame.start();
    log(`Programa iniciado! (${ast.screenWidth}x${ast.screenHeight}, ${ast.actors.length} atores)`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      log(`Erro: ${err.message}`, true);
    } else {
      log(`Erro desconhecido: ${String(err)}`, true);
    }
  }
}

// Event Listeners
btnRun.addEventListener('click', runCode);
btnStop.addEventListener('click', () => {
  stopCurrentGame();
  log('Execução interrompida.');
});

exampleSelect.addEventListener('change', () => {
  const chosen = exampleSelect.value;
  if (EXAMPLES[chosen]) {
    editor.value = EXAMPLES[chosen];
    runCode();
  }
});

// Keyboard controls
window.addEventListener('keydown', (e) => {
  if (document.activeElement === editor) return;
  if (currentGame) {
    currentGame.handleKeyDown(e.key);
  }
});

window.addEventListener('keyup', (e) => {
  if (document.activeElement === editor) return;
  if (currentGame) {
    currentGame.handleKeyUp(e.key);
  }
});

// Virtual Pad
function bindPadBtn(id: string, keyName: string) {
  const btn = document.getElementById(id);
  if (!btn) return;
  const press = (e: Event) => {
    e.preventDefault();
    if (currentGame) currentGame.handleKeyDown(keyName);
  };
  const release = (e: Event) => {
    e.preventDefault();
    if (currentGame) currentGame.handleKeyUp(keyName);
  };

  btn.addEventListener('mousedown', press);
  btn.addEventListener('mouseup', release);
  btn.addEventListener('touchstart', press, { passive: false });
  btn.addEventListener('touchend', release, { passive: false });
}

bindPadBtn('pad-up', 'ArrowUp');
bindPadBtn('pad-down', 'ArrowDown');
bindPadBtn('pad-left', 'ArrowLeft');
bindPadBtn('pad-right', 'ArrowRight');
bindPadBtn('pad-act', ' ');

// Initial load
editor.value = EXAMPLES.pong;
runCode();
