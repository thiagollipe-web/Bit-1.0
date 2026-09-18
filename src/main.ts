import { BIT_LIBRARY, type LibraryItem } from './library-data.ts';

// retro MS-DOS color hex mappings
const DOS_COLORS: Record<string, string> = {
  black: '#000000',
  blue: '#0000aa',
  green: '#00aa00',
  cyan: '#00aaaa',
  red: '#aa0000',
  magenta: '#aa00aa',
  brown: '#aa5500',
  gray: '#aaaaaa',
  dark_gray: '#555555',
  blue_bright: '#5555ff',
  green_bright: '#55ff55',
  cyan_bright: '#55ffff',
  red_bright: '#ff5555',
  magenta_bright: '#ff55ff',
  yellow: '#ffff55',
  white: '#ffffff'
};

const PORTUGUESE_COLOR_MAP: Record<string, string> = {
  preto: 'black',
  azul: 'blue',
  verde: 'green',
  ciano: 'cyan',
  vermelho: 'red',
  magenta: 'magenta',
  marrom: 'brown',
  cinza: 'gray',
  cinza_claro: 'gray',
  cinza_escuro: 'dark_gray',
  azul_claro: 'blue_bright',
  verde_claro: 'green_bright',
  ciano_claro: 'cyan_bright',
  vermelho_claro: 'red_bright',
  magenta_claro: 'magenta_bright',
  amarelo: 'yellow',
  branco: 'white',
  laranja: 'brown',
  roxo: 'magenta',
  rosa: 'magenta_bright'
};

// Python Game Engine Starter Templates
const STARTER_TEMPLATES: Record<string, (title: string) => string> = {
  hello_world: (title: string) => `import game

# Inicializa tela 40x25
game.init(width=40, height=25, title="${title}")

def update():
    # Limpa a tela com fundo preto
    game.clear("black")
    
    # Desenha bordas amarelas
    game.draw(0, 0, "╔" + "═"*38 + "╗", "yellow")
    for y in range(1, 24):
        game.draw(0, y, "║", "yellow")
        game.draw(39, y, "║", "yellow")
    game.draw(0, 24, "╚" + "═"*38 + "╝", "yellow")
    
    # Textos da tela
    game.draw(11, 4, "SISTEMA OPERACIONAL DOS", "white")
    game.draw(11, 6, "C:\\\\> PYTHON3.EXE", "gray")
    game.draw(11, 9, "OLÁ, MUNDO RETRO!", "green_bright")
    game.draw(4, 15, "Pressione WASD/Setas para interagir", "cyan_bright")
    
    # Cursor piscando
    if int(game.time() * 2) % 2 == 0:
        game.draw(27, 6, "▒", "white")

# Registra o loop principal
game.loop(update)
`,

  interactive_move: (title: string) => `import game

# Inicializa tela 40x25
game.init(width=40, height=25, title="${title}")

# Posição do jogador
x = 20
y = 12

def update():
    global x, y
    
    # Controles por teclas
    if game.key("arrowleft") or game.key("a"):
        x -= 1
    if game.key("arrowright") or game.key("d"):
        x += 1
    if game.key("arrowup") or game.key("w"):
        y -= 1
    if game.key("arrowdown") or game.key("s"):
        y += 1
        
    # Limita o jogador às bordas
    colidiu_borda = False
    if x < 1:
        x = 1
        colidiu_borda = True
    if x > 38:
        x = 38
        colidiu_borda = True
    if y < 1:
        y = 1
        colidiu_borda = True
    if y > 23:
        y = 23
        colidiu_borda = True
        
    # Som ao colidir nas bordas
    if colidiu_borda:
        game.beep(150, 0.05)
        
    # Desenho
    game.clear("black")
    
    # Desenha bordas azuis
    game.draw(0, 0, "█"*40, "blue")
    game.draw(0, 24, "█"*40, "blue")
    for r in range(1, 24):
        game.draw(0, r, "█", "blue")
        game.draw(39, r, "█", "blue")
        
    # Informações e Jogador
    game.draw(2, 2, "Use setas ou WASD para mover o jogador", "white")
    game.draw(x, y, "😎", "green_bright")
    
    # Status
    game.draw(2, 22, f"Pos: {x}, {y}", "yellow")

game.loop(update)
`,

  pong: (title: string) => `import game

# Inicializa tela
game.init(width=40, height=25, title="${title}")

p1_y = 10
p2_y = 10
bx, by = 20, 12
bvx, bvy = 0.5, 0.3
pts1, pts2 = 0, 0

def update():
    global p1_y, p2_y, bx, by, bvx, bvy, pts1, pts2
    
    # Teclado Player 1 (W/S)
    if game.key("w") and p1_y > 1:
        p1_y -= 1
    if game.key("s") and p1_y < 20:
        p1_y += 1
        
    # IA do Player 2
    if by > p2_y + 1 and p2_y < 20:
        p2_y += 1
    elif by < p2_y + 1 and p2_y > 1:
        p2_y -= 1
        
    # Movimentação da Bola
    bx += bvx
    by += bvy
    
    # Rebate em cima e embaixo
    if by <= 1 or by >= 23:
        bvy = -bvy
        by += bvy
        game.beep(400, 0.05)
        
    # Gol Jogador 2
    if bx < 1:
        pts2 += 1
        bx, by = 20, 12
        bvx = 0.5
        game.beep(150, 0.3)
        game.log(f"Jogador 2 marcou! Placar: {pts1} x {pts2}")
        
    # Gol Jogador 1
    elif bx > 38:
        pts1 += 1
        bx, by = 20, 12
        bvx = -0.5
        game.beep(150, 0.3)
        game.log(f"Jogador 1 marcou! Placar: {pts1} x {pts2}")
        
    # Colisão com Paleta 1 (Esquerda)
    if bx <= 2 and p1_y <= by <= p1_y + 3:
        bvx = abs(bvx) * 1.1
        bx = 2
        game.beep(600, 0.05)
        
    # Colisão com Paleta 2 (Direita)
    if bx >= 37 and p2_y <= by <= p2_y + 3:
        bvx = -abs(bvx) * 1.1
        bx = 37
        game.beep(600, 0.05)
        
    # Desenho
    game.clear("black")
    
    # Linha divisória e bordas
    game.draw(0, 0, "═"*40, "gray")
    game.draw(0, 24, "═"*40, "gray")
    
    # Placar
    game.draw(15, 2, f"{pts1}   {pts2}", "yellow")
    
    # Desenha as Paletas
    for i in range(4):
        game.draw(1, p1_y + i, "█", "cyan_bright")
        game.draw(38, p2_y + i, "█", "green_bright")
        
    # Desenha a Bola
    game.draw(int(bx), int(by), "●", "white")

game.loop(update)
`,

  space_invaders: (title: string) => `import game

# Inicializa tela
game.init(width=40, height=25, title="${title}")

ship_x = 18
laser_x, laser_y = -1, -1
aliens = [{"x": 5 + i * 5, "y": 3, "dir": 1} for i in range(6)]
score = 0

def update():
    global ship_x, laser_x, laser_y, score
    
    # Movimento da Nave
    if (game.key("arrowleft") or game.key("a")) and ship_x > 1:
        ship_x -= 1
    if (game.key("arrowright") or game.key("d")) and ship_x < 36:
        ship_x += 1
        
    # Disparo com Espaço ou Enter
    if (game.key("espaco") or game.key("enter")) and laser_y == -1:
        laser_x = ship_x + 1
        laser_y = 21
        game.beep(800, 0.08)
        
    # Movimento do Laser
    if laser_y != -1:
        laser_y -= 1
        if laser_y < 1:
            laser_y = -1
            
    # Movimento dos Alienígenas
    descer_todos = False
    for al in aliens:
        al["x"] += al["dir"] * 0.2
        if al["x"] >= 37 or al["x"] <= 1:
            al["dir"] = -al["dir"]
            descer_todos = True
            
    if descer_todos:
        for al in aliens:
            al["y"] += 1
            if al["y"] >= 21:
                game.beep(80, 0.4)
                game.log("Fim de Jogo! Os alienígenas invadiram a base!")
                score = 0
                al["y"] = 3
                
    # Colisão Laser com Alienígena
    if laser_y != -1:
        for al in aliens:
            if int(al["x"]) <= laser_x <= int(al["x"]) + 2 and int(al["y"]) == laser_y:
                aliens.remove(al)
                laser_y = -1
                score += 10
                game.beep(300, 0.1)
                game.log(f"Inimigo abatido! Pontos: {score}")
                break
                
    # Respawn de Alienígenas se todos forem eliminados
    if not aliens:
        for i in range(6):
            aliens.append({"x": 5 + i * 5, "y": 3, "dir": 1})
            
    # Renderização da Tela
    game.clear("black")
    
    # Desenho da Nave
    game.draw(ship_x, 22, " ▲ \\n■■■", "green_bright")
    
    # Laser
    if laser_y != -1:
        game.draw(laser_x, laser_y, "│", "yellow")
        
    # Alienígenas
    for al in aliens:
        game.draw(int(al["x"]), int(al["y"]), "👾", "red_bright")
        
    # Painel Superior
    game.draw(1, 0, f"PLACAR: {score}", "cyan_bright")

game.loop(update)
`,

  tetris: (title: string) => `import game

# Inicializa tela
game.init(width=40, height=25, title="${title}")

block_x, block_y = 18, 1
block_type = 1
score = 0
pile = {} 

def update():
    global block_x, block_y, block_type, score, pile
    
    # Controles
    if game.key("arrowleft") or game.key("a"):
        if block_x > 11:
            block_x -= 1
    if game.key("arrowright") or game.key("d"):
        if block_x < 26:
            block_x += 1
    if game.key("arrowdown") or game.key("s"):
        block_y += 0.5
        
    # Gravidade
    block_y += 0.1
    
    # Formatos de blocos
    if block_type == 1:
        piece, pw, ph, color = "■■\\n■■", 2, 2, "yellow"
    elif block_type == 2:
        piece, pw, ph, color = "■■■■", 4, 1, "cyan_bright"
    else:
        piece, pw, ph, color = " ■ \\n■■■", 3, 2, "magenta_bright"
        
    # Verifica impacto
    colidiu = False
    if block_y + ph >= 23:
        colidiu = True
        block_y = 23 - ph
        
    for px in range(pw):
        for py in range(ph):
            grid_x = int(block_x) + px
            grid_y = int(block_y) + py + 1
            if (grid_x, grid_y) in pile:
                colidiu = True
                
    if colidiu:
        # Adiciona bloco à pilha
        for px in range(pw):
            for py in range(ph):
                grid_x = int(block_x) + px
                grid_y = int(block_y) + py
                pile[(grid_x, grid_y)] = color
                
        score += 10
        game.beep(120, 0.05)
        
        block_x, block_y = 18, 1
        block_type = game.random(1, 3)
        
        # Limpa linhas completadas
        for r in range(1, 23):
            linha_completa = True
            for c in range(11, 28):
                if (c, r) not in pile:
                    linha_completa = False
                    break
            if linha_completa:
                for c in range(11, 28):
                    del pile[(c, r)]
                nova_pilha = {}
                for (cx, cy), c_cor in pile.items():
                    if cy < r:
                        nova_pilha[(cx, cy + 1)] = c_cor
                    else:
                        nova_pilha[(cx, cy)] = c_cor
                pile = nova_pilha
                score += 100
                game.beep(800, 0.2)
                game.log("MUITO BEM! Linha limpa! +100!")
                
        if (18, 2) in pile:
            game.beep(80, 0.5)
            game.log(f"Game Over! Pontuação Final: {score}")
            pile.clear()
            score = 0
            
    # Desenho da Tela
    game.clear("black")
    
    # Paredes do tabuleiro
    game.draw(9, 0, "║\\n"*24, "gray")
    game.draw(29, 0, "║\\n"*24, "gray")
    game.draw(9, 23, "╚" + "═"*19 + "╝", "gray")
    
    # Placar
    game.draw(31, 3, "PONTOS", "white")
    game.draw(31, 4, f"{score:05d}", "green_bright")
    
    # Instruções
    game.draw(1, 3, "TETRIS", "yellow")
    game.draw(1, 5, "Setas/WASD", "gray")
    game.draw(1, 6, "para mover", "gray")
    
    for (cx, cy), c_cor in pile.items():
        game.draw(cx, cy, "■", c_cor)
        
    game.draw(int(block_x), int(block_y), piece, color)

game.loop(update)
`,

  vazio: (title: string) => `import game

# Inicializa tela 40x25
game.init(width=40, height=25, title="${title}")

def update():
    game.clear("black")
    game.draw(10, 10, "TELA EM BRANCO", "green_bright")

game.loop(update)
`,

  bomberman: (title: string) => `import game

# Inicializa tela compacta 40x25
game.init(30, 20, "BOMBERMAN MINI")

W, H = 11, 9
px, py = 1, 1
pts, vds = 0, 3
fim, win = False, False
grade = [['#' if r in (0,H-1) or c in (0,W-1) or (r%2==0 and c%2==0) else ('B' if game.random(1,10)<=6 and not (r<=2 and c<=2) else ' ') for c in range(W)] for r in range(H)]
inimigos = [{"x": 9, "y": 7, "dx": -1, "dy": 0, "t": 0}]
bombas, explosoes = [], []
ult_t = 0

def livre(gx, gy):
    if gx < 0 or gx >= W or gy < 0 or gy >= H: return False
    if grade[gy][gx] in ('#', 'B'): return False
    return not any(b["x"] == gx and b["y"] == gy for b in bombas)

def atualizar():
    global px, py, pts, vds, fim, win, ult_t, grade, bombas, explosoes
    t = game.time()
    game.clear("black")
    
    # Moldura retro
    game.draw(0, 0, "█"*30, "blue")
    game.draw(0, 19, "█"*30, "blue")
    game.draw(7, 1, "BOMBERMAN RETRO", "yellow")

    if fim:
        game.draw(8, 9, "GAME OVER!", "red")
        game.draw(5, 11, "Pressione 'R' p/ reiniciar", "cyan_bright")
        if game.key("r"):
            px, py, pts, vds, fim, win = 1, 1, 0, 3, False, False
            bombas.clear(); explosoes.clear(); inimigos.clear()
            inimigos.append({"x": 9, "y": 7, "dx": -1, "dy": 0, "t": 0})
            game.beep(300, 0.1)
        return

    if win:
        game.draw(8, 9, "VOCE VENCEU!", "green_bright")
        game.draw(5, 11, "Pressione 'R' p/ novo jogo", "cyan_bright")
        if game.key("r"): fim = True
        return

    # Controles
    if t - ult_t > 0.15:
        dx, dy = 0, 0
        if game.key("arrowleft") or game.key("a"): dx = -1
        elif game.key("arrowright") or game.key("d"): dx = 1
        elif game.key("arrowup") or game.key("w"): dy = -1
        elif game.key("arrowdown") or game.key("s"): dy = 1

        if (dx or dy) and livre(px+dx, py+dy):
            px += dx
            py += dy
            ult_t = t
            game.beep(500, 0.02)

        if (game.key("espaco") or game.key("enter")) and not bombas:
            bombas.append({"x": px, "y": py, "t": t})
            ult_t = t
            game.beep(200, 0.05)

    # Detonação de Bombas
    bombas_restantes = []
    for b in bombas:
        if t - b["t"] >= 1.3:
            game.beep(100, 0.2)
            for rx, ry in [(0,0), (0,-1), (0,1), (-1,0), (1,0)]:
                ex, ey = b["x"]+rx, b["y"]+ry
                if 0 <= ex < W and 0 <= ey < H and grade[ey][ex] != '#':
                    explosoes.append({"x": ex, "y": ey, "t": t})
                    if grade[ey][ex] == 'B':
                        grade[ey][ex] = ' '
                        pts += 50
                    for en in list(inimigos):
                        if en["x"] == ex and en["y"] == ey:
                            inimigos.remove(en)
                            pts += 200
                    if px == ex and py == ey:
                        vds -= 1
                        px, py = 1, 1
                        game.beep(150, 0.3)
                        if vds <= 0: fim = True
        else:
            bombas_restantes.append(b)
    bombas = bombas_restantes

    explosoes = [e for e in explosoes if t - e["t"] < 0.35]

    # Movimento Inimigos
    for en in inimigos:
        en["t"] += 1
        if en["t"] >= 7:
            en["t"] = 0
            nx, ny = en["x"]+en["dx"], en["y"]+en["dy"]
            if livre(nx, ny) and game.random(1, 10) > 2:
                en["x"], en["y"] = nx, ny
            else:
                dirs = [(dx,dy) for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)] if livre(en["x"]+dx, en["y"]+dy)]
                if dirs:
                    en["dx"], en["dy"] = dirs[game.random(0, len(dirs)-1)]
                    en["x"] += en["dx"]
                    en["y"] += en["dy"]
            if en["x"] == px and en["y"] == py:
                vds -= 1
                px, py = 1, 1
                game.beep(150, 0.3)
                if vds <= 0: fim = True

    if not inimigos and not fim: win = True

    # Renderiza Grid Centralizado
    ox, oy = 4, 4
    for r in range(H):
        for c in range(W):
            char = grade[r][c]
            if char == '#': game.draw(ox+c*2, oy+r, "██", "gray")
            elif char == 'B': game.draw(ox+c*2, oy+r, "▓▓", "brown")
            else: game.draw(ox+c*2, oy+r, "░░", "dark_gray")

    for b in bombas:
        game.draw(ox+b["x"]*2, oy+b["y"], "💣", "red_bright" if int(t*4)%2==0 else "red")
    for e in explosoes:
        game.draw(ox+e["x"]*2, oy+e["y"], "☼☼", "yellow")
    for en in inimigos:
        game.draw(ox+en["x"]*2, oy+en["y"], "👾", "red_bright")

    game.draw(ox+px*2, oy+py, "☺", "green_bright")

    # Status
    game.draw(2, 2, f"PTS: {pts:04d}", "cyan_bright")
    game.draw(18, 2, f"VIDAS: {'♥'*vds}", "magenta_bright")
    game.draw(1, 18, "Setas/WASD: Mover  Espaco: Bomba", "white")

game.loop(atualizar)
`
};

const EXAMPLES: Record<string, string> = {
  hello_world: STARTER_TEMPLATES.hello_world("Olá, Mundo!"),
  interactive_move: STARTER_TEMPLATES.interactive_move("Controle de Ator"),
  pong: STARTER_TEMPLATES.pong("Retro Pong"),
  space_invaders: STARTER_TEMPLATES.space_invaders("Space Invaders"),
  tetris: STARTER_TEMPLATES.tetris("MS-DOS Tetris"),
  bomberman: STARTER_TEMPLATES.bomberman("Bomberman Retro")
};

// UI Elements Queries
const btnNew = document.getElementById('btn-new') as HTMLButtonElement;
const btnExport = document.getElementById('btn-export') as HTMLButtonElement;
const btnImport = document.getElementById('btn-import') as HTMLButtonElement;
const fileImport = document.getElementById('file-import') as HTMLInputElement;
const btnLibrary = document.getElementById('btn-library') as HTMLButtonElement;
const btnAi = document.getElementById('btn-ai') as HTMLButtonElement;
const exampleSelect = document.getElementById('example-select') as HTMLSelectElement;
const btnRun = document.getElementById('btn-run') as HTMLButtonElement;
const btnStop = document.getElementById('btn-stop') as HTMLButtonElement;

const projectTitle = document.getElementById('project-title') as HTMLSpanElement;
const saveStatus = document.getElementById('save-status') as HTMLSpanElement;
const btnQuickAi = document.getElementById('btn-quick-ai') as HTMLButtonElement;
const cursorPos = document.getElementById('cursor-pos') as HTMLSpanElement;
const editor = document.getElementById('code-editor') as HTMLTextAreaElement;

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const consoleOutput = document.getElementById('console-output') as HTMLDivElement;

// Modals
const modal = document.getElementById('new-modal') as HTMLDivElement;
const btnModalClose = document.getElementById('btn-modal-close') as HTMLButtonElement;
const btnModalCancel = document.getElementById('btn-modal-cancel') as HTMLButtonElement;
const btnModalConfirm = document.getElementById('btn-modal-confirm') as HTMLButtonElement;
const inputProgramName = document.getElementById('new-program-name') as HTMLInputElement;
const templateCards = document.querySelectorAll('.template-card');

const libraryModal = document.getElementById('library-modal') as HTMLDivElement;
const btnLibClose = document.getElementById('btn-lib-close') as HTMLButtonElement;
const libSearchInput = document.getElementById('lib-search-input') as HTMLInputElement;
const libCatBtns = document.querySelectorAll('.lib-cat-btn');
const libList = document.getElementById('lib-list') as HTMLDivElement;

const aiModal = document.getElementById('ai-modal') as HTMLDivElement;
const btnAiClose = document.getElementById('btn-ai-close') as HTMLButtonElement;
const aiChips = document.querySelectorAll('.ai-chip');
const aiPromptLabel = document.getElementById('ai-prompt-label') as HTMLLabelElement;
const aiPromptInput = document.getElementById('ai-prompt-input') as HTMLTextAreaElement;
const aiIncludeCode = document.getElementById('ai-include-code') as HTMLInputElement;
const btnAiSubmit = document.getElementById('btn-ai-submit') as HTMLButtonElement;
const aiSubmitSpinner = document.getElementById('ai-submit-spinner') as HTMLSpanElement;
const aiSubmitText = document.getElementById('ai-submit-text') as HTMLSpanElement;
const aiResponseContainer = document.getElementById('ai-response-container') as HTMLDivElement;
const aiReplyContent = document.getElementById('ai-reply-content') as HTMLDivElement;

const btnAiCopy = document.getElementById('btn-ai-copy') as HTMLButtonElement;
const btnAiInsert = document.getElementById('btn-ai-insert') as HTMLButtonElement;
const btnAiReplace = document.getElementById('btn-ai-replace') as HTMLButtonElement;

// State Management
let currentAiAction = 'new_game';
let lastAiExtractedCode = '';
let isRunning = false;
let pyodide: any = null;
let isPyodideLoading = false;

// Terminal Grid State
let cols = 40;
let rows = 25;
const cellW = 8;
const cellH = 12;
let cellBuffer: { char: string; color: string; bg: string }[][] = [];
let bg_color = 'black';
const pressedKeys = new Set<string>();
let pythonUpdateFunc: any = null;
let gameStartTime = 0;
let animationFrameId: number | null = null;
let audioCtx: AudioContext | null = null;

let currentLibCategory = 'todas';
let currentLibSearch = '';
let currentTemplateKey = 'hello_world';
let saveTimeout: number | null = null;

// Local Storage configurations
const STORAGE_KEY_CODE = 'py_user_code_12';
const STORAGE_KEY_TITLE = 'py_user_title_12';

function loadUserCode(): string {
  const saved = localStorage.getItem(STORAGE_KEY_CODE);
  if (saved && saved.trim().length > 0) {
    return saved;
  }
  return EXAMPLES.hello_world;
}

function loadUserTitle(): string {
  const saved = localStorage.getItem(STORAGE_KEY_TITLE);
  if (saved && saved.trim().length > 0) {
    return saved;
  }
  return 'Olá, Mundo!';
}

function saveUserCode(code: string, title?: string) {
  localStorage.setItem(STORAGE_KEY_CODE, code);
  if (title) {
    localStorage.setItem(STORAGE_KEY_TITLE, title);
  }
  saveStatus.textContent = 'Salvo';
  saveStatus.style.color = 'var(--primary)';
}

function notifyEditing() {
  if (exampleSelect.value === 'meu_programa') {
    saveStatus.textContent = 'Salvando...';
    saveStatus.style.color = 'var(--accent)';
    if (saveTimeout !== null) clearTimeout(saveTimeout);
    saveTimeout = window.setTimeout(() => {
      saveUserCode(editor.value);
    }, 400);
  } else {
    saveStatus.textContent = 'Modo Exemplo';
    saveStatus.style.color = 'var(--text-muted)';
  }
}

function updateCursorPos() {
  const text = editor.value.substring(0, editor.selectionStart);
  const lines = text.split('\n');
  const line = lines.length;
  const col = lines[lines.length - 1].length + 1;
  cursorPos.textContent = `Linha ${line}, Col ${col}`;
}

function log(msg: string, isError = false) {
  const el = document.createElement('div');
  el.className = isError ? 'log-entry log-error' : 'log-entry';
  el.textContent = msg;
  consoleOutput.appendChild(el);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Reset character grid buffer
function resetBuffer() {
  cellBuffer = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({ char: ' ', color: 'white', bg: 'black' });
    }
    cellBuffer.push(row);
  }
}

// Javascript API bridge exposed to Pyodide
function js_game_init(width: number, height: number, title?: string) {
  cols = width || 40;
  rows = height || 25;
  
  // Dynamically size canvas based on grid dimensions
  canvas.width = cols * cellW;
  canvas.height = rows * cellH;
  
  if (title) {
    log(`[SISTEMA DOS] Inicializado: ${cols}x${rows} - "${title}"`);
  }
  resetBuffer();
}

function js_game_clear(colorName?: string) {
  let normalizedBg = colorName ? String(colorName).toLowerCase().trim() : 'black';
  if (PORTUGUESE_COLOR_MAP[normalizedBg]) {
    normalizedBg = PORTUGUESE_COLOR_MAP[normalizedBg];
  }
  bg_color = DOS_COLORS[normalizedBg] ? normalizedBg : 'black';
  
  // Fill all cells with blank spaces
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cellBuffer[r]?.[c]) {
        cellBuffer[r][c].char = ' ';
        cellBuffer[r][c].color = 'white';
        cellBuffer[r][c].bg = bg_color;
      }
    }
  }
}

function js_game_draw(x: number, y: number, text: any, colorName: string) {
  let normalizedColor = colorName ? String(colorName).toLowerCase().trim() : 'white';
  if (PORTUGUESE_COLOR_MAP[normalizedColor]) {
    normalizedColor = PORTUGUESE_COLOR_MAP[normalizedColor];
  }
  if (!DOS_COLORS[normalizedColor]) {
    normalizedColor = 'white';
  }

  const lines = String(text).split('\n');
  lines.forEach((line, lineOffset) => {
    const currentY = Math.floor(y) + lineOffset;
    if (currentY < 0 || currentY >= rows) return;

    // Correctly split characters to preserve multi-byte emojis
    const chars = Array.from(line);
    chars.forEach((char, charOffset) => {
      const currentX = Math.floor(x) + charOffset;
      if (currentX < 0 || currentX >= cols) return;

      if (cellBuffer[currentY]?.[currentX]) {
        cellBuffer[currentY][currentX] = {
          char: char,
          color: normalizedColor,
          bg: bg_color
        };
      }
    });
  });
}

function js_game_key(keyName: string): boolean {
  const name = String(keyName).toLowerCase().trim();
  if (name === 'espaco' || name === 'space') {
    return pressedKeys.has(' ') || pressedKeys.has('espaco');
  }
  if (name === 'cima' || name === 'up') {
    return pressedKeys.has('arrowup') || pressedKeys.has('cima');
  }
  if (name === 'baixo' || name === 'down') {
    return pressedKeys.has('arrowdown') || pressedKeys.has('baixo');
  }
  if (name === 'esquerda' || name === 'left') {
    return pressedKeys.has('arrowleft') || pressedKeys.has('esquerda');
  }
  if (name === 'direita' || name === 'right') {
    return pressedKeys.has('arrowright') || pressedKeys.has('direita');
  }
  return pressedKeys.has(name);
}

function js_game_beep(freq: number, duration: number) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'square'; // Authentic PC Speaker square wave
    osc.frequency.setValueAtTime(freq || 440, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime); // comfortable volume
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (err) {
    console.warn("Could not play retro speaker beep:", err);
  }
}

function js_game_log(msg: any) {
  log(`> ${String(msg)}`);
}

function js_game_random(min: number, max: number): number {
  const rMin = Math.ceil(min);
  const rMax = Math.floor(max);
  return Math.floor(Math.random() * (rMax - rMin + 1)) + rMin;
}

function js_game_time(): number {
  return (performance.now() - gameStartTime) / 1000.0;
}

function js_game_loop(updateFunc: any) {
  pythonUpdateFunc = updateFunc;
}

// Render the grid monospace characters onto the canvas
function renderTerminalCanvas() {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Render background color
  ctx.fillStyle = DOS_COLORS[bg_color] || '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Configure high-definition pixelated font rendering
  ctx.font = `bold ${cellH}px "Fira Code", "Courier New", Courier, monospace`;
  ctx.textBaseline = 'top';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = cellBuffer[r]?.[c];
      if (!cell || cell.char === ' ') continue;

      // Draw custom background if any
      if (cell.bg && cell.bg !== 'black' && DOS_COLORS[cell.bg]) {
        ctx.fillStyle = DOS_COLORS[cell.bg];
        ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
      }

      // Draw character
      ctx.fillStyle = DOS_COLORS[cell.color] || '#ffffff';
      // Restrict text rendering width to ensure alignment
      ctx.fillText(cell.char, c * cellW, r * cellH, cellW);
    }
  }
}

// Core loop ticker
function gameTick() {
  if (!isRunning) return;

  if (pythonUpdateFunc) {
    try {
      pythonUpdateFunc();
    } catch (err: any) {
      log(`Erro de Execução Python: ${err.message || String(err)}`, true);
      stopCurrentGame();
      return;
    }
  }

  renderTerminalCanvas();

  if (isRunning) {
    animationFrameId = requestAnimationFrame(gameTick);
  }
}

// Load and spin up Pyodide WebAssembly
async function ensurePyodide() {
  if (pyodide) return pyodide;
  if (isPyodideLoading) {
    while (isPyodideLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return pyodide;
  }

  isPyodideLoading = true;
  log("Iniciando interpretador Python (Pyodide) via WebAssembly...");
  try {
    pyodide = await (window as any).loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/"
    });

    // Expose Javascript functions directly to pyodide scope
    pyodide.globals.set("js_game_init", js_game_init);
    pyodide.globals.set("js_game_clear", js_game_clear);
    pyodide.globals.set("js_game_draw", js_game_draw);
    pyodide.globals.set("js_game_key", js_game_key);
    pyodide.globals.set("js_game_beep", js_game_beep);
    pyodide.globals.set("js_game_log", js_game_log);
    pyodide.globals.set("js_game_random", js_game_random);
    pyodide.globals.set("js_game_time", js_game_time);
    pyodide.globals.set("js_game_loop", js_game_loop);

    // Register modules in python
    await pyodide.runPythonAsync(`
import sys
import types

def python_init(width=40, height=25, title="Jogo"):
    js_game_init(width, height, title)

def python_clear(color="black"):
    js_game_clear(color)

def python_draw(x, y, texto, cor="white"):
    js_game_draw(x, y, texto, cor)

def python_key(nome_da_tecla):
    return js_game_key(nome_da_tecla)

def python_beep(frequencia=440, duracao=0.1):
    js_game_beep(frequencia, duracao)

def python_log(mensagem):
    js_game_log(mensagem)

def python_random(min_val, max_val):
    return js_game_random(min_val, max_val)

def python_time():
    return js_game_time()

def python_loop(funcao_de_atualizacao):
    js_game_loop(funcao_de_atualizacao)

_game_mod = types.ModuleType('game')
_game_mod.init = python_init
_game_mod.clear = python_clear
_game_mod.draw = python_draw
_game_mod.key = python_key
_game_mod.beep = python_beep
_game_mod.log = python_log
_game_mod.random = python_random
_game_mod.time = python_time
_game_mod.loop = python_loop

_dos_mod = types.ModuleType('dos')
_dos_mod.init = python_init
_dos_mod.clear = python_clear
_dos_mod.draw = python_draw
_dos_mod.key = python_key
_dos_mod.beep = python_beep
_dos_mod.log = python_log
_dos_mod.random = python_random
_dos_mod.time = python_time
_dos_mod.loop = python_loop

sys.modules['game'] = _game_mod
sys.modules['dos'] = _dos_mod
`);

    log("Interpretador Python carregado! Motor pronto para execução.");
    isPyodideLoading = false;
    return pyodide;
  } catch (err: any) {
    log(`Falha ao carregar o interpretador Python: ${err.message || String(err)}`, true);
    isPyodideLoading = false;
    throw err;
  }
}

function stopCurrentGame() {
  isRunning = false;
  pythonUpdateFunc = null;
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

async function runCode() {
  stopCurrentGame();
  consoleOutput.innerHTML = '';
  
  const code = editor.value;
  log("Compilando código Python...");
  
  try {
    const py = await ensurePyodide();
    
    // Default grid config
    cols = 40;
    rows = 25;
    bg_color = 'black';
    resetBuffer();
    
    // Match logical dimensions
    canvas.width = cols * cellW;
    canvas.height = rows * cellH;

    // Reset loop function and execution stopwatch
    pythonUpdateFunc = null;
    gameStartTime = performance.now();
    isRunning = true;

    // Execute user code
    await py.runPythonAsync(code);

    log("Código executado! Iniciando game loop retro...");
    gameTick();
  } catch (err: any) {
    log(`Erro na Execução: ${err.message || String(err)}`, true);
    stopCurrentGame();
  }
}

// Keyboards bindings
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  pressedKeys.add(key);
  if (key === 'arrowleft') pressedKeys.add('esquerda');
  if (key === 'arrowright') pressedKeys.add('direita');
  if (key === 'arrowup') pressedKeys.add('cima');
  if (key === 'arrowdown') pressedKeys.add('baixo');
  if (key === ' ') pressedKeys.add('espaco');
});

window.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  pressedKeys.delete(key);
  if (key === 'arrowleft') pressedKeys.delete('esquerda');
  if (key === 'arrowright') pressedKeys.delete('direita');
  if (key === 'arrowup') pressedKeys.delete('cima');
  if (key === 'arrowdown') pressedKeys.delete('baixo');
  if (key === ' ') pressedKeys.delete('espaco');
});

// Modals Setup
function openModal() {
  inputProgramName.value = 'Meu Novo Jogo';
  currentTemplateKey = 'hello_world';
  templateCards.forEach((c) => {
    const key = c.getAttribute('data-template');
    if (key === 'hello_world') c.classList.add('selected');
    else c.classList.remove('selected');
  });
  modal.classList.remove('hidden');
  inputProgramName.focus();
  inputProgramName.select();
}

function closeModal() {
  modal.classList.add('hidden');
}

templateCards.forEach((card) => {
  card.addEventListener('click', () => {
    templateCards.forEach((c) => c.classList.remove('selected'));
    card.classList.add('selected');
    currentTemplateKey = card.getAttribute('data-template') || 'hello_world';
  });
});

btnNew.addEventListener('click', openModal);
btnModalClose.addEventListener('click', closeModal);
btnModalCancel.addEventListener('click', closeModal);

btnModalConfirm.addEventListener('click', () => {
  const title = inputProgramName.value.trim() || 'Meu Novo Jogo';
  const templateGen = STARTER_TEMPLATES[currentTemplateKey] || STARTER_TEMPLATES.hello_world;
  const newCode = templateGen(title);

  exampleSelect.value = 'meu_programa';
  projectTitle.textContent = title;
  editor.value = newCode;
  saveUserCode(newCode, title);

  closeModal();
  runCode();
  log(`Novo programa "${title}" criado em Python com sucesso!`);
});

// Library Rendering and search
function renderLibraryList() {
  const query = currentLibSearch.trim().toLowerCase();
  libList.innerHTML = '';

  const filtered = BIT_LIBRARY.filter((item) => {
    const matchCategory = currentLibCategory === 'todas' || item.category === currentLibCategory;
    if (!matchCategory) return false;
    if (!query) return true;
    return (
      item.name.toLowerCase().includes(query) ||
      item.syntax.toLowerCase().includes(query) ||
      item.desc.toLowerCase().includes(query) ||
      item.example.toLowerCase().includes(query)
    );
  });

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.style.textAlign = 'center';
    empty.style.padding = '24px';
    empty.style.color = 'var(--text-muted)';
    empty.textContent = 'Nenhum comando encontrado.';
    libList.appendChild(empty);
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'lib-item-card';

    const header = document.createElement('div');
    header.className = 'lib-item-header';

    const title = document.createElement('div');
    title.className = 'lib-item-title';
    title.textContent = item.name;

    const badge = document.createElement('div');
    badge.className = 'lib-item-badge';
    badge.textContent = item.category;

    header.appendChild(title);
    header.appendChild(badge);

    const syntax = document.createElement('div');
    syntax.className = 'lib-item-syntax';
    syntax.textContent = item.syntax;

    const desc = document.createElement('div');
    desc.className = 'lib-item-desc';
    desc.textContent = item.desc;

    const example = document.createElement('div');
    example.className = 'lib-item-example';
    example.textContent = item.example;

    const actions = document.createElement('div');
    actions.className = 'lib-item-actions';

    const btnCopy = document.createElement('button');
    btnCopy.className = 'btn-lib-action';
    btnCopy.textContent = '📋 Copiar';
    btnCopy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(item.example || item.syntax);
        btnCopy.textContent = '✓ Copiado!';
        setTimeout(() => {
          btnCopy.textContent = '📋 Copiar';
        }, 1200);
      } catch {
        btnCopy.textContent = 'Erro';
      }
    });

    const btnInsert = document.createElement('button');
    btnInsert.className = 'btn-lib-action btn-new';
    btnInsert.textContent = '➕ Inserir';
    btnInsert.addEventListener('click', () => {
      const toInsert = `\n${item.example || item.syntax}\n`;
      insertCodeAtCursor(toInsert);
      closeLibraryModal();
      log(`Comando "${item.name}" inserido.`);
    });

    actions.appendChild(btnCopy);
    actions.appendChild(btnInsert);

    card.appendChild(header);
    card.appendChild(syntax);
    card.appendChild(desc);
    card.appendChild(example);
    card.appendChild(actions);

    libList.appendChild(card);
  });
}

function openLibraryModal() {
  currentLibSearch = '';
  libSearchInput.value = '';
  currentLibCategory = 'todas';
  libCatBtns.forEach((b) => {
    if (b.getAttribute('data-cat') === 'todas') b.classList.add('active');
    else b.classList.remove('active');
  });
  renderLibraryList();
  libraryModal.classList.remove('hidden');
  libSearchInput.focus();
}

function closeLibraryModal() {
  libraryModal.classList.add('hidden');
}

btnLibrary.addEventListener('click', openLibraryModal);
btnLibClose.addEventListener('click', closeLibraryModal);

libSearchInput.addEventListener('input', () => {
  currentLibSearch = libSearchInput.value;
  renderLibraryList();
});

libCatBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    libCatBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentLibCategory = btn.getAttribute('data-cat') || 'todas';
    renderLibraryList();
  });
});

// Code Snippets Insertions
function insertCodeAtCursor(codeToInsert: string) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const before = editor.value.substring(0, start);
  const after = editor.value.substring(end);

  editor.value = before + codeToInsert + after;
  editor.selectionStart = editor.selectionEnd = start + codeToInsert.length;
  editor.focus();
  notifyEditing();
  updateCursorPos();
}

const SNIPPETS: Record<string, string> = {
  import: `import game\n`,
  draw: `game.draw(x, y, "😎", "green_bright")\n`,
  loop: `def update():\n    game.clear()\n    game.draw(20, 12, "●", "white")\n\ngame.loop(update)\n`,
  beep: `game.beep(frequency=440, duration=0.1)\n`
};

document.querySelectorAll('.btn-snippet').forEach((btn) => {
  btn.addEventListener('click', () => {
    const snippetKey = btn.getAttribute('data-snippet') || '';
    const codeToInsert = SNIPPETS[snippetKey];
    if (codeToInsert) {
      insertCodeAtCursor(codeToInsert);
    }
  });
});

editor.addEventListener('input', () => {
  notifyEditing();
  updateCursorPos();
});
editor.addEventListener('click', updateCursorPos);
editor.addEventListener('keyup', updateCursorPos);

// Game Control Bindings
btnRun.addEventListener('click', runCode);
btnStop.addEventListener('click', () => {
  stopCurrentGame();
  log('Execução pausada. Sistema limpo.');
});

exampleSelect.addEventListener('change', () => {
  const chosen = exampleSelect.value;
  if (chosen === 'meu_programa') {
    const savedCode = loadUserCode();
    const savedTitle = loadUserTitle();
    projectTitle.textContent = savedTitle;
    editor.value = savedCode;
    saveStatus.textContent = 'Salvo';
    saveStatus.style.color = 'var(--primary)';
  } else if (EXAMPLES[chosen]) {
    projectTitle.textContent = `Exemplo: ${chosen.toUpperCase()}`;
    editor.value = EXAMPLES[chosen];
    saveStatus.textContent = 'Exemplo';
    saveStatus.style.color = 'var(--text-muted)';
  }
  runCode();
});

// AI Assistant UI configurations
const AI_ACTION_CONFIG: Record<string, { label: string; placeholder: string }> = {
  new_game: {
    label: 'Qual jogo estilo terminal MS-DOS você deseja criar com IA?',
    placeholder: 'Ex: Crie um jogo de corrida retro desviando de buracos com beeps ao colidir...'
  },
  add_feature: {
    label: 'Qual recurso ou elemento você deseja adicionar a este código?',
    placeholder: 'Ex: Adicione uma mecânica de atirar lasers com a barra de espaço...'
  },
  fix: {
    label: 'Qual erro ou comportamento você quer corrigir neste código Python?',
    placeholder: 'Ex: Corrija o movimento para não deixar o jogador atravessar as paredes...'
  },
  explain: {
    label: 'O que você deseja que a IA explique sobre a lógica deste código?',
    placeholder: 'Ex: Explique detalhadamente como funciona a física da gravidade...'
  },
  custom: {
    label: 'Escreva sua dúvida livre sobre Python MS-DOS:',
    placeholder: 'Ex: Como fazer um texto piscar de 1 em 1 segundo usando game.time()?'
  }
};

function setAiAction(action: string) {
  currentAiAction = action;
  aiChips.forEach((chip) => {
    if (chip.getAttribute('data-action') === action) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  const cfg = AI_ACTION_CONFIG[action] || AI_ACTION_CONFIG.new_game;
  aiPromptLabel.textContent = cfg.label;
  aiPromptInput.placeholder = cfg.placeholder;
}

function openAiModal(initialAction = 'new_game') {
  setAiAction(initialAction);
  aiModal.classList.remove('hidden');
  aiPromptInput.focus();
}

function closeAiModal() {
  aiModal.classList.add('hidden');
}

function renderFormattedAiReply(text: string) {
  aiReplyContent.innerHTML = '';
  // Split on python code blocks
  const parts = text.split(/(```(?:python)?[\s\S]*?```)/g);

  for (const part of parts) {
    if (part.startsWith('```')) {
      const match = part.match(/```(?:python)?\s*([\s\S]*?)```/);
      const code = match ? match[1].trim() : part.replace(/```/g, '').trim();
      const pre = document.createElement('pre');
      pre.className = 'ai-code-block';
      pre.textContent = code;
      aiReplyContent.appendChild(pre);
    } else {
      const trimmed = part.trim();
      if (trimmed) {
        const p = document.createElement('div');
        p.style.marginBottom = '8px';
        p.textContent = trimmed;
        aiReplyContent.appendChild(p);
      }
    }
  }
}

async function requestAiAssistance() {
  const prompt = aiPromptInput.value.trim();
  if (!prompt && currentAiAction !== 'explain' && currentAiAction !== 'fix') {
    aiPromptInput.focus();
    return;
  }

  aiSubmitSpinner.style.display = 'inline-block';
  aiSubmitText.textContent = 'Gerando com IA...';
  btnAiSubmit.disabled = true;

  try {
    const res = await fetch('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt || (currentAiAction === 'explain' ? 'Explique o código' : 'Corrija erros no código'),
        currentCode: aiIncludeCode.checked ? editor.value : undefined,
        action: currentAiAction
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || `Erro HTTP ${res.status}`);
    }

    lastAiExtractedCode = data.extractedCode || '';
    renderFormattedAiReply(data.reply || '');
    aiResponseContainer.classList.remove('hidden');

    if (!lastAiExtractedCode) {
      btnAiCopy.style.display = 'none';
      btnAiInsert.style.display = 'none';
      btnAiReplace.style.display = 'none';
    } else {
      btnAiCopy.style.display = 'inline-flex';
      btnAiInsert.style.display = 'inline-flex';
      btnAiReplace.style.display = 'inline-flex';
    }
  } catch (err: any) {
    const msg = err.message || String(err);
    aiReplyContent.innerHTML = `<div style="color: var(--danger); padding: 8px;">⚠️ Não foi possível obter resposta da IA: ${msg}</div>`;
    aiResponseContainer.classList.remove('hidden');
    btnAiCopy.style.display = 'none';
    btnAiInsert.style.display = 'none';
    btnAiReplace.style.display = 'none';
  } finally {
    aiSubmitSpinner.style.display = 'none';
    aiSubmitText.textContent = '🚀 Gerar com IA';
    btnAiSubmit.disabled = false;
  }
}

btnAi.addEventListener('click', () => openAiModal('new_game'));
if (btnQuickAi) {
  btnQuickAi.addEventListener('click', () => openAiModal('add_feature'));
}
btnAiClose.addEventListener('click', closeAiModal);

aiChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const action = chip.getAttribute('data-action') || 'new_game';
    setAiAction(action);
  });
});

btnAiSubmit.addEventListener('click', requestAiAssistance);

aiPromptInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    requestAiAssistance();
  }
});

btnAiCopy.addEventListener('click', async () => {
  if (!lastAiExtractedCode) return;
  try {
    await navigator.clipboard.writeText(lastAiExtractedCode);
    btnAiCopy.textContent = '✓ Copiado!';
    setTimeout(() => {
      btnAiCopy.textContent = '📋 Copiar Código';
    }, 1200);
  } catch {
    btnAiCopy.textContent = 'Erro';
  }
});

btnAiInsert.addEventListener('click', () => {
  if (!lastAiExtractedCode) return;
  insertCodeAtCursor(`\n${lastAiExtractedCode}\n`);
  closeAiModal();
  log('Código da IA inserido no editor.');
  runCode();
});

btnAiReplace.addEventListener('click', () => {
  if (!lastAiExtractedCode) return;
  editor.value = lastAiExtractedCode;
  saveUserCode(lastAiExtractedCode);
  closeAiModal();
  log('Código da IA aplicado no editor! Executando...');
  runCode();
});

// Local file save and open logic
btnExport.addEventListener('click', () => {
  const code = editor.value;
  const title = projectTitle.textContent?.trim() || 'meu_jogo';
  const safeName = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_\-]/g, '_') || 'meu_jogo';

  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}.py`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  log(`Código exportado com sucesso como "${safeName}.py"!`);
});

btnImport.addEventListener('click', () => {
  fileImport.click();
});

fileImport.addEventListener('change', (e) => {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const file = target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    const content = event.target?.result;
    if (typeof content === 'string') {
      let title = file.name.replace(/\.py$/i, '');
      const firstLine = content.split('\n')[0]?.trim();
      if (firstLine && firstLine.startsWith('#')) {
        const potentialTitle = firstLine.replace(/^#\s*/, '').trim();
        if (potentialTitle) {
          title = potentialTitle;
        }
      }

      projectTitle.textContent = title;
      editor.value = content;
      exampleSelect.value = 'meu_programa';
      saveUserCode(content, title);
      log(`Código "${title}" importado com sucesso!`);
      runCode();
    }
  };
  reader.readAsText(file);
  target.value = '';
});

// Gamepad controls mappings
function bindPadBtn(id: string, keyName: string) {
  const btn = document.getElementById(id);
  if (!btn) return;
  const press = (e: Event) => {
    e.preventDefault();
    pressedKeys.add(keyName.toLowerCase());
  };
  const release = (e: Event) => {
    e.preventDefault();
    pressedKeys.delete(keyName.toLowerCase());
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

// Initialize Pyodide compiling environment in background on load
ensurePyodide();

// Load saved user code or default example
const initialCode = loadUserCode();
const initialTitle = loadUserTitle();
projectTitle.textContent = initialTitle;
exampleSelect.value = 'hello_world'; // Set default view example selection to first example
editor.value = initialCode;
saveStatus.textContent = 'Salvo';

// Run user code automatically on start
runCode();
