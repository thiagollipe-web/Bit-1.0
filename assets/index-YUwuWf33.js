(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const c of r.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&o(c)}).observe(document,{childList:!0,subtree:!0});function t(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(n){if(n.ep)return;n.ep=!0;const r=t(n);fetch(n.href,r)}})();const Me=[{name:"game.init",category:"cenario",syntax:"game.init(colunas, linhas, titulo)",desc:"Inicializa o terminal MS-DOS com as dimensões de grade (padrão 40x25 ou customizado) e o título da janela.",example:`import game

game.init(width=40, height=25, title="MEU JOGO RETRO")`},{name:"game.clear",category:"cenario",syntax:"game.clear(cor)",desc:'Limpa a tela do terminal inteira, preenchendo o plano de fundo com a cor selecionada (padrão "black").',example:'game.clear("black")'},{name:"game.log",category:"cenario",syntax:"game.log(mensagem)",desc:"Exibe uma string de mensagem ou logs no painel inferior do sistema, simulando o prompt do DOS.",example:'game.log(f"Pontuação atualizada: {pontos}")'},{name:"game.draw",category:"atores",syntax:"game.draw(x, y, texto_ou_ascii, cor)",desc:"Desenha um caractere ou uma arte ASCII multi-linha nas coordenadas de grade (X: coluna, Y: linha). Se a string contiver quebras de linha (\\n), o motor desenha cada linha sequencialmente.",example:`game.draw(18, 12, "😎", "green_bright")
# Para ASCII multi-linha:
game.draw(5, 5, " ▲ \\n■■■", "cyan")`},{name:"game.beep",category:"comportamento",syntax:"game.beep(frequencia, duracao)",desc:"Sintetiza um som clássico de PC Speaker retro (onda quadrada) com frequência em Hz e duração em segundos.",example:`game.beep(440, 0.1) # Beep do PC Speaker em Lá (440Hz)
game.beep(150, 0.3) # Som de Game Over ou colisão grave`},{name:"game.loop",category:"eventos",syntax:"game.loop(funcao_de_atualizacao)",desc:"Inicia o loop do jogo registrando a função que o motor deve executar a cada frame (aproximadamente 30/60 fps).",example:`def atualizar():
    game.clear()
    game.draw(20, 12, "★", "yellow")

game.loop(atualizar)`},{name:"game.key",category:"controle",syntax:"game.key(nome_da_tecla)",desc:'Retorna verdadeiro se a tecla informada estiver pressionada. Teclas suportadas: "arrowup" ou "cima", "arrowdown" ou "baixo", "arrowleft" ou "esquerda", "arrowright" ou "direita", "espaco", "enter", "w", "a", "s", "d", "r", etc.',example:`if game.key("arrowleft") or game.key("a"):
    jogador_x -= 1`},{name:"game.random",category:"funcoes",syntax:"game.random(min, max)",desc:"Retorna um número inteiro aleatório entre min e max (inclusive). Útil para spawnar itens ou inimigos de forma aleatória.",example:"obstaculo_x = game.random(5, 35)"},{name:"game.time",category:"funcoes",syntax:"game.time()",desc:"Retorna o tempo de execução decorrido desde o início do jogo em segundos (como um float de alta precisão).",example:`segundos = game.time()
if segundos % 2 < 1:
    game.draw(2, 2, "PISCAR", "white")`},{name:"Paleta MS-DOS 16 cores",category:"cores",syntax:"Cores retro disponíveis",desc:'Cores suportadas pelo console MS-DOS: "black" (preto), "blue" (azul), "green" (verde), "cyan" (ciano), "red" (vermelho), "magenta" (rosa escuro), "brown" (marrom/laranja), "gray" (cinza), "dark_gray" (cinza escuro), "blue_bright" (azul claro), "green_bright" (verde claro), "cyan_bright" (ciano claro), "red_bright" (vermelho claro), "magenta_bright" (rosa claro), "yellow" (amarelo), "white" (branco).',example:`game.clear("black")
game.draw(10, 10, "ERRO NO DISCO", "red_bright")`}],L={black:"#000000",blue:"#0000aa",green:"#00aa00",cyan:"#00aaaa",red:"#aa0000",magenta:"#aa00aa",brown:"#aa5500",gray:"#aaaaaa",dark_gray:"#555555",blue_bright:"#5555ff",green_bright:"#55ff55",cyan_bright:"#55ffff",red_bright:"#ff5555",magenta_bright:"#ff55ff",yellow:"#ffff55",white:"#ffffff"},U={preto:"black",azul:"blue",verde:"green",ciano:"cyan",vermelho:"red",magenta:"magenta",marrom:"brown",cinza:"gray",cinza_claro:"gray",cinza_escuro:"dark_gray",azul_claro:"blue_bright",verde_claro:"green_bright",ciano_claro:"cyan_bright",vermelho_claro:"red_bright",magenta_claro:"magenta_bright",amarelo:"yellow",branco:"white",laranja:"brown",roxo:"magenta",rosa:"magenta_bright"},w={hello_world:e=>`import game

# Inicializa tela 40x25
game.init(width=40, height=25, title="${e}")

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
`,interactive_move:e=>`import game

# Inicializa tela 40x25
game.init(width=40, height=25, title="${e}")

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
`,pong:e=>`import game

# Inicializa tela
game.init(width=40, height=25, title="${e}")

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
`,space_invaders:e=>`import game

# Inicializa tela
game.init(width=40, height=25, title="${e}")

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
`,tetris:e=>`import game

# Inicializa tela
game.init(width=40, height=25, title="${e}")

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
`,vazio:e=>`import game

# Inicializa tela 40x25
game.init(width=40, height=25, title="${e}")

def update():
    game.clear("black")
    game.draw(10, 10, "TELA EM BRANCO", "green_bright")

game.loop(update)
`,bomberman:e=>`import game

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
`},Z={hello_world:w.hello_world("Olá, Mundo!"),interactive_move:w.interactive_move("Controle de Ator"),pong:w.pong("Retro Pong"),space_invaders:w.space_invaders("Space Invaders"),tetris:w.tetris("MS-DOS Tetris"),bomberman:w.bomberman("Bomberman Retro")},Oe=document.getElementById("btn-new"),je=document.getElementById("btn-export"),Re=document.getElementById("btn-import"),ue=document.getElementById("file-import"),ze=document.getElementById("btn-library"),Ne=document.getElementById("btn-ai"),A=document.getElementById("example-select"),De=document.getElementById("btn-run"),qe=document.getElementById("btn-stop"),T=document.getElementById("project-title"),p=document.getElementById("save-status"),de=document.getElementById("btn-quick-ai"),$e=document.getElementById("cursor-pos"),l=document.getElementById("code-editor"),E=document.getElementById("game-canvas"),N=document.getElementById("console-output"),ye=document.getElementById("new-modal"),Fe=document.getElementById("btn-modal-close"),Ge=document.getElementById("btn-modal-cancel"),Ue=document.getElementById("btn-modal-confirm"),D=document.getElementById("new-program-name"),ee=document.querySelectorAll(".template-card"),fe=document.getElementById("library-modal"),He=document.getElementById("btn-lib-close"),H=document.getElementById("lib-search-input"),ae=document.querySelectorAll(".lib-cat-btn"),Q=document.getElementById("lib-list"),be=document.getElementById("ai-modal"),We=document.getElementById("btn-ai-close"),_e=document.querySelectorAll(".ai-chip"),Je=document.getElementById("ai-prompt-label"),M=document.getElementById("ai-prompt-input"),Ke=document.getElementById("ai-include-code"),te=document.getElementById("btn-ai-submit"),ce=document.getElementById("ai-submit-spinner"),me=document.getElementById("ai-submit-text"),ge=document.getElementById("ai-response-container"),q=document.getElementById("ai-reply-content"),v=document.getElementById("btn-ai-copy"),$=document.getElementById("btn-ai-insert"),F=document.getElementById("btn-ai-replace");let P="new_game",_="",W=!1,d=null,B=!1,h=40,x=25;const I=8,S=12;let b=[],O="black";const i=new Set;let j=null,he=0,G=null,g=null,J="todas",oe="",ne="hello_world",X=null;const xe="py_user_code_12",we="py_user_title_12";function ve(){const e=localStorage.getItem(xe);return e&&e.trim().length>0?e:Z.hello_world}function Ee(){const e=localStorage.getItem(we);return e&&e.trim().length>0?e:"Olá, Mundo!"}function V(e,a){localStorage.setItem(xe,e),a&&localStorage.setItem(we,a),p.textContent="Salvo",p.style.color="var(--primary)"}function Ce(){A.value==="meu_programa"?(p.textContent="Salvando...",p.style.color="var(--accent)",X!==null&&clearTimeout(X),X=window.setTimeout(()=>{V(l.value)},400)):(p.textContent="Modo Exemplo",p.style.color="var(--text-muted)")}function Y(){const a=l.value.substring(0,l.selectionStart).split(`
`),t=a.length,o=a[a.length-1].length+1;$e.textContent=`Linha ${t}, Col ${o}`}function s(e,a=!1){const t=document.createElement("div");t.className=a?"log-entry log-error":"log-entry",t.textContent=e,N.appendChild(t),N.scrollTop=N.scrollHeight}function ke(){b=[];for(let e=0;e<x;e++){const a=[];for(let t=0;t<h;t++)a.push({char:" ",color:"white",bg:"black"});b.push(a)}}function Ve(e,a,t){h=e||40,x=a||25,E.width=h*I,E.height=x*S,t&&s(`[SISTEMA DOS] Inicializado: ${h}x${x} - "${t}"`),ke()}function Ye(e){let a=e?String(e).toLowerCase().trim():"black";U[a]&&(a=U[a]),O=L[a]?a:"black";for(let t=0;t<x;t++)for(let o=0;o<h;o++)b[t]?.[o]&&(b[t][o].char=" ",b[t][o].color="white",b[t][o].bg=O)}function Qe(e,a,t,o){let n=o?String(o).toLowerCase().trim():"white";U[n]&&(n=U[n]),L[n]||(n="white"),String(t).split(`
`).forEach((c,u)=>{const m=Math.floor(a)+u;if(m<0||m>=x)return;Array.from(c).forEach((k,y)=>{const f=Math.floor(e)+y;f<0||f>=h||b[m]?.[f]&&(b[m][f]={char:k,color:n,bg:O})})})}function Xe(e){const a=String(e).toLowerCase().trim();return a==="espaco"||a==="space"?i.has(" ")||i.has("espaco"):a==="cima"||a==="up"?i.has("arrowup")||i.has("cima"):a==="baixo"||a==="down"?i.has("arrowdown")||i.has("baixo"):a==="esquerda"||a==="left"?i.has("arrowleft")||i.has("esquerda"):a==="direita"||a==="right"?i.has("arrowright")||i.has("direita"):i.has(a)}function Ze(e,a){try{g||(g=new(window.AudioContext||window.webkitAudioContext)),g.state==="suspended"&&g.resume();const t=g.createOscillator(),o=g.createGain();t.type="square",t.frequency.setValueAtTime(e||440,g.currentTime),o.gain.setValueAtTime(.08,g.currentTime),o.gain.exponentialRampToValueAtTime(.001,g.currentTime+a),t.connect(o),o.connect(g.destination),t.start(),t.stop(g.currentTime+a)}catch(t){console.warn("Could not play retro speaker beep:",t)}}function ea(e){s(`> ${String(e)}`)}function aa(e,a){const t=Math.ceil(e),o=Math.floor(a);return Math.floor(Math.random()*(o-t+1))+t}function ta(){return(performance.now()-he)/1e3}function oa(e){j=e}function na(){const e=E.getContext("2d");if(e){e.fillStyle=L[O]||"#000000",e.fillRect(0,0,E.width,E.height),e.font=`bold ${S}px "Fira Code", "Courier New", Courier, monospace`,e.textBaseline="top";for(let a=0;a<x;a++)for(let t=0;t<h;t++){const o=b[a]?.[t];!o||o.char===" "||(o.bg&&o.bg!=="black"&&L[o.bg]&&(e.fillStyle=L[o.bg],e.fillRect(t*I,a*S,I,S)),e.fillStyle=L[o.color]||"#ffffff",e.fillText(o.char,t*I,a*S,I))}}}function Le(){if(W){if(j)try{j()}catch(e){s(`Erro de Execução Python: ${e.message||String(e)}`,!0),K();return}na(),W&&(G=requestAnimationFrame(Le))}}async function Ie(){if(d)return d;if(B){for(;B;)await new Promise(e=>setTimeout(e,100));return d}B=!0,s("Iniciando interpretador Python (Pyodide) via WebAssembly...");try{return d=await window.loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.26.4/full/"}),d.globals.set("js_game_init",Ve),d.globals.set("js_game_clear",Ye),d.globals.set("js_game_draw",Qe),d.globals.set("js_game_key",Xe),d.globals.set("js_game_beep",Ze),d.globals.set("js_game_log",ea),d.globals.set("js_game_random",aa),d.globals.set("js_game_time",ta),d.globals.set("js_game_loop",oa),await d.runPythonAsync(`
import sys
import types
from pyodide.ffi import create_proxy

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
    js_game_loop(create_proxy(funcao_de_atualizacao))

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
`),s("Interpretador Python carregado! Motor pronto para execução."),B=!1,d}catch(e){throw s(`Falha ao carregar o interpretador Python: ${e.message||String(e)}`,!0),B=!1,e}}function K(){W=!1,j=null,G!==null&&(cancelAnimationFrame(G),G=null)}async function C(){K(),N.innerHTML="";const e=l.value;s("Compilando código Python...");try{const a=await Ie();h=40,x=25,O="black",ke(),E.width=h*I,E.height=x*S,j=null,he=performance.now(),W=!0,await a.runPythonAsync(e),s("Código executado! Iniciando game loop retro..."),Le()}catch(a){s(`Erro na Execução: ${a.message||String(a)}`,!0),K()}}window.addEventListener("keydown",e=>{const a=e.key.toLowerCase();i.add(a),a==="arrowleft"&&i.add("esquerda"),a==="arrowright"&&i.add("direita"),a==="arrowup"&&i.add("cima"),a==="arrowdown"&&i.add("baixo"),a===" "&&i.add("espaco")});window.addEventListener("keyup",e=>{const a=e.key.toLowerCase();i.delete(a),a==="arrowleft"&&i.delete("esquerda"),a==="arrowright"&&i.delete("direita"),a==="arrowup"&&i.delete("cima"),a==="arrowdown"&&i.delete("baixo"),a===" "&&i.delete("espaco")});function ra(){D.value="Meu Novo Jogo",ne="hello_world",ee.forEach(e=>{e.getAttribute("data-template")==="hello_world"?e.classList.add("selected"):e.classList.remove("selected")}),ye.classList.remove("hidden"),D.focus(),D.select()}function re(){ye.classList.add("hidden")}ee.forEach(e=>{e.addEventListener("click",()=>{ee.forEach(a=>a.classList.remove("selected")),e.classList.add("selected"),ne=e.getAttribute("data-template")||"hello_world"})});Oe.addEventListener("click",ra);Fe.addEventListener("click",re);Ge.addEventListener("click",re);Ue.addEventListener("click",()=>{const e=D.value.trim()||"Meu Novo Jogo",t=(w[ne]||w.hello_world)(e);A.value="meu_programa",T.textContent=e,l.value=t,V(t,e),re(),C(),s(`Novo programa "${e}" criado em Python com sucesso!`)});function ie(){const e=oe.trim().toLowerCase();Q.innerHTML="";const a=Me.filter(t=>J==="todas"||t.category===J?e?t.name.toLowerCase().includes(e)||t.syntax.toLowerCase().includes(e)||t.desc.toLowerCase().includes(e)||t.example.toLowerCase().includes(e):!0:!1);if(a.length===0){const t=document.createElement("div");t.style.textAlign="center",t.style.padding="24px",t.style.color="var(--text-muted)",t.textContent="Nenhum comando encontrado.",Q.appendChild(t);return}a.forEach(t=>{const o=document.createElement("div");o.className="lib-item-card";const n=document.createElement("div");n.className="lib-item-header";const r=document.createElement("div");r.className="lib-item-title",r.textContent=t.name;const c=document.createElement("div");c.className="lib-item-badge",c.textContent=t.category,n.appendChild(r),n.appendChild(c);const u=document.createElement("div");u.className="lib-item-syntax",u.textContent=t.syntax;const m=document.createElement("div");m.className="lib-item-desc",m.textContent=t.desc;const z=document.createElement("div");z.className="lib-item-example",z.textContent=t.example;const k=document.createElement("div");k.className="lib-item-actions";const y=document.createElement("button");y.className="btn-lib-action",y.textContent="📋 Copiar",y.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(t.example||t.syntax),y.textContent="✓ Copiado!",setTimeout(()=>{y.textContent="📋 Copiar"},1200)}catch{y.textContent="Erro"}});const f=document.createElement("button");f.className="btn-lib-action btn-new",f.textContent="➕ Inserir",f.addEventListener("click",()=>{const Pe=`
${t.example||t.syntax}
`;le(Pe),Se(),s(`Comando "${t.name}" inserido.`)}),k.appendChild(y),k.appendChild(f),o.appendChild(n),o.appendChild(u),o.appendChild(m),o.appendChild(z),o.appendChild(k),Q.appendChild(o)})}function ia(){oe="",H.value="",J="todas",ae.forEach(e=>{e.getAttribute("data-cat")==="todas"?e.classList.add("active"):e.classList.remove("active")}),ie(),fe.classList.remove("hidden"),H.focus()}function Se(){fe.classList.add("hidden")}ze.addEventListener("click",ia);He.addEventListener("click",Se);H.addEventListener("input",()=>{oe=H.value,ie()});ae.forEach(e=>{e.addEventListener("click",()=>{ae.forEach(a=>a.classList.remove("active")),e.classList.add("active"),J=e.getAttribute("data-cat")||"todas",ie()})});function le(e){const a=l.selectionStart,t=l.selectionEnd,o=l.value.substring(0,a),n=l.value.substring(t);l.value=o+e+n,l.selectionStart=l.selectionEnd=a+e.length,l.focus(),Ce(),Y()}const la={import:`import game
`,draw:`game.draw(x, y, "😎", "green_bright")
`,loop:`def update():
    game.clear()
    game.draw(20, 12, "●", "white")

game.loop(update)
`,beep:`game.beep(frequency=440, duration=0.1)
`};document.querySelectorAll(".btn-snippet").forEach(e=>{e.addEventListener("click",()=>{const a=e.getAttribute("data-snippet")||"",t=la[a];t&&le(t)})});l.addEventListener("input",()=>{Ce(),Y()});l.addEventListener("click",Y);l.addEventListener("keyup",Y);De.addEventListener("click",C);qe.addEventListener("click",()=>{K(),s("Execução pausada. Sistema limpo.")});A.addEventListener("change",()=>{const e=A.value;if(e==="meu_programa"){const a=ve(),t=Ee();T.textContent=t,l.value=a,p.textContent="Salvo",p.style.color="var(--primary)"}else Z[e]&&(T.textContent=`Exemplo: ${e.toUpperCase()}`,l.value=Z[e],p.textContent="Exemplo",p.style.color="var(--text-muted)");C()});const pe={new_game:{label:"Qual jogo estilo terminal MS-DOS você deseja criar com IA?",placeholder:"Ex: Crie um jogo de corrida retro desviando de buracos com beeps ao colidir..."},add_feature:{label:"Qual recurso ou elemento você deseja adicionar a este código?",placeholder:"Ex: Adicione uma mecânica de atirar lasers com a barra de espaço..."},fix:{label:"Qual erro ou comportamento você quer corrigir neste código Python?",placeholder:"Ex: Corrija o movimento para não deixar o jogador atravessar as paredes..."},explain:{label:"O que você deseja que a IA explique sobre a lógica deste código?",placeholder:"Ex: Explique detalhadamente como funciona a física da gravidade..."},custom:{label:"Escreva sua dúvida livre sobre Python MS-DOS:",placeholder:"Ex: Como fazer um texto piscar de 1 em 1 segundo usando game.time()?"}};function Ae(e){P=e,_e.forEach(t=>{t.getAttribute("data-action")===e?t.classList.add("active"):t.classList.remove("active")});const a=pe[e]||pe.new_game;Je.textContent=a.label,M.placeholder=a.placeholder}function Te(e="new_game"){Ae(e),be.classList.remove("hidden"),M.focus()}function se(){be.classList.add("hidden")}function sa(e){q.innerHTML="";const a=e.split(/(```(?:python)?[\s\S]*?```)/g);for(const t of a)if(t.startsWith("```")){const o=t.match(/```(?:python)?\s*([\s\S]*?)```/),n=o?o[1].trim():t.replace(/```/g,"").trim(),r=document.createElement("pre");r.className="ai-code-block",r.textContent=n,q.appendChild(r)}else{const o=t.trim();if(o){const n=document.createElement("div");n.style.marginBottom="8px",n.textContent=o,q.appendChild(n)}}}async function Be(){const e=M.value.trim();if(!e&&P!=="explain"&&P!=="fix"){M.focus();return}ce.style.display="inline-block",me.textContent="Gerando com IA...",te.disabled=!0;try{const a=await fetch("/api/ai/assistant",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:e||(P==="explain"?"Explique o código":"Corrija erros no código"),currentCode:Ke.checked?l.value:void 0,action:P})}),t=await a.json();if(!a.ok||!t.success)throw new Error(t.error||`Erro HTTP ${a.status}`);_=t.extractedCode||"",sa(t.reply||""),ge.classList.remove("hidden"),_?(v.style.display="inline-flex",$.style.display="inline-flex",F.style.display="inline-flex"):(v.style.display="none",$.style.display="none",F.style.display="none")}catch(a){const t=a.message||String(a);q.innerHTML=`<div style="color: var(--danger); padding: 8px;">⚠️ Não foi possível obter resposta da IA: ${t}</div>`,ge.classList.remove("hidden"),v.style.display="none",$.style.display="none",F.style.display="none"}finally{ce.style.display="none",me.textContent="🚀 Gerar com IA",te.disabled=!1}}Ne.addEventListener("click",()=>Te("new_game"));de&&de.addEventListener("click",()=>Te("add_feature"));We.addEventListener("click",se);_e.forEach(e=>{e.addEventListener("click",()=>{const a=e.getAttribute("data-action")||"new_game";Ae(a)})});te.addEventListener("click",Be);M.addEventListener("keydown",e=>{e.key==="Enter"&&(e.ctrlKey||e.metaKey)&&(e.preventDefault(),Be())});v.addEventListener("click",async()=>{if(_)try{await navigator.clipboard.writeText(_),v.textContent="✓ Copiado!",setTimeout(()=>{v.textContent="📋 Copiar Código"},1200)}catch{v.textContent="Erro"}});$.addEventListener("click",()=>{_&&(le(`
${_}
`),se(),s("Código da IA inserido no editor."),C())});F.addEventListener("click",()=>{_&&(l.value=_,V(_),se(),s("Código da IA aplicado no editor! Executando..."),C())});je.addEventListener("click",()=>{const e=l.value,t=(T.textContent?.trim()||"meu_jogo").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9_\-]/g,"_")||"meu_jogo",o=new Blob([e],{type:"text/plain;charset=utf-8"}),n=URL.createObjectURL(o),r=document.createElement("a");r.href=n,r.download=`${t}.py`,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(n),s(`Código exportado com sucesso como "${t}.py"!`)});Re.addEventListener("click",()=>{ue.click()});ue.addEventListener("change",e=>{const a=e.target;if(!a.files||a.files.length===0)return;const t=a.files[0],o=new FileReader;o.onload=n=>{const r=n.target?.result;if(typeof r=="string"){let c=t.name.replace(/\.py$/i,"");const u=r.split(`
`)[0]?.trim();if(u&&u.startsWith("#")){const m=u.replace(/^#\s*/,"").trim();m&&(c=m)}T.textContent=c,l.value=r,A.value="meu_programa",V(r,c),s(`Código "${c}" importado com sucesso!`),C()}},o.readAsText(t),a.value=""});function R(e,a){const t=document.getElementById(e);if(!t)return;const o=r=>{r.preventDefault(),i.add(a.toLowerCase())},n=r=>{r.preventDefault(),i.delete(a.toLowerCase())};t.addEventListener("mousedown",o),t.addEventListener("mouseup",n),t.addEventListener("touchstart",o,{passive:!1}),t.addEventListener("touchend",n,{passive:!1})}R("pad-up","ArrowUp");R("pad-down","ArrowDown");R("pad-left","ArrowLeft");R("pad-right","ArrowRight");R("pad-act"," ");Ie();const da=ve(),ca=Ee();T.textContent=ca;A.value="hello_world";l.value=da;p.textContent="Salvo";C();
