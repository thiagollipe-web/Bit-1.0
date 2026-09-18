# 💾 PYTHON MS-DOS v1.2 — Retro Game Engine 🚀

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![WebAssembly](https://img.shields.io/badge/WebAssembly-654FF0?style=for-the-badge&logo=webassembly&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

> Um motor de desenvolvimento de jogos retro inspirado no clássico ambiente do MS-DOS. Escreva jogos completos em Python diretamente no seu navegador, renderizados com fidelidade ASCII ultra-fluida de 60 FPS e efeitos sonoros gerados por síntese de áudio!

---

## 🎨 O Projeto: Visão Geral

O **PYTHON MS-DOS v1.2** é um ecossistema completo de desenvolvimento e emulação de jogos retro. Ele unifica a simplicidade de script da linguagem **Python** com o poder e desempenho do **TypeScript** rodando nativamente no navegador através do **WebAssembly (Pyodide)**.

O projeto oferece uma interface gráfica que simula uma central retro, completa com um editor de código embutido, console de diagnóstico de execução em tempo real, painel de logs, botões físicos de gabinete para carregar projetos e uma tela de renderização simulando monitores de tubo (CRT).

---

## ⚙️ Arquitetura e Engenharia Gráfica

O motor gráfico foi projetado seguindo os melhores padrões de engenharia de jogos para WebAssembly:

1. **Render Pipeline de Alta Performance (ASCII Grid Rendering):**
   A tela de visualização utiliza um grid lógico de caracteres ASCII de alta fidelidade de cores. O fluxo de desenho (`game.draw`) opera por amostragem de frames e sincronização vertical (`requestAnimationFrame`), evitando flickers de tela e mantendo um framerate cravado em **60 FPS+**.

2. **Gerenciador de Memória e Coleta de Lixo (Garbage Collection Bridge):**
   Para evitar falhas de referências emprestadas (*borrowed proxies*) entre a máquina virtual WebAssembly (Python/Pyodide) e o motor de renderização (JS/TS), a engine utiliza proxies permanentes (`create_proxy`) na passagem de loops de atualização. Isso previne estouros de VRAM e vazamentos de memória na aba do usuário.

3. **Síntese Sonora Retro (PC Speaker Simulator):**
   Todos os sons do emulador (beeps de colisão, explosões e passos) são gerados em tempo real através da **Web Audio API** do navegador utilizando osciladores sintéticos (`sine`, `square`), simulando com perfeição os alto-falantes internos dos computadores pessoais dos anos 80/90.

---

## 👾 Jogos Integrados de Fábrica

O motor já vem acompanhado de jogos completos escritos inteiramente em português e prontos para rodar:

### 1. 💣 Bomberman Retro (Destaque Especial)
Uma versão compacta e extremamente polida do clássico de ação:
* **Mecânicas:** Movimentação em 4 eixos, grade de blocos indestrutíveis e tijolos destrutíveis (com chance de geração randômica).
* **Física de Explosões:** Plantio de bomba temporizada (`1.5s`) que pisca em vermelho-vivo e explode em cruz, quebrando barreiras, eliminando monstros e retirando vidas do jogador.
* **Inteligência Artificial (IA):** Inimigos patrulham dinamicamente o mapa procurando rotas livres e desviando de obstáculos.
* **Efeitos de Áudio:** Beeps sonoros modulados baseados no estado do jogo (movimentação, detonação, dano).

### 2. 🧱 MS-DOS Tetris
O quebra-cabeças de blocos com física de rotação clássica, detecção de linhas cheias, pontuação progressiva e efeitos sonoros a cada queda.

### 3. 👾 Space Invaders
Defenda a galáxia atirando em hordas de alienígenas que se movem de forma cadenciada em direção à Terra, com controle de projéteis e pontuação retro.

### 4. 🎾 Retro Pong
O clássico ping-pong arcade de dois jogadores ou contra o computador, com física de colisão elástica e aceleração progressiva da bolinha.

---

## 🛠️ Como Programar em 1 Minuto!

A API exposta para o ambiente Python é extremamente limpa e poderosa:

```python
import game

# Inicializa tela (largura, altura, título)
game.init(30, 20, "Meu Jogo Retro")

x, y = 5, 5

def atualizar():
    global x, y
    game.clear("black") # Limpa tela
    
    # Desenha molduras
    game.draw(0, 0, "██"*15, "blue")
    
    # Controles do jogador
    if game.key("arrowright"): x += 1
    if game.key("arrowleft"): x -= 1
    
    # Desenha jogador (☺) e emite beeps!
    game.draw(x, y, "☺", "green_bright")
    
    if game.key("espaco"):
        game.beep(600, 0.05) # Frequência em Hz, Duração em segundos

# Define o ciclo principal do jogo
game.loop(atualizar)
```

---

## 🚀 Como Rodar o Projeto Localmente

Para rodar o projeto localmente em seu computador para desenvolvimento ou lazer:

1. **Clone o repositório:**
   ```bash
   git clone <link-do-seu-repositorio>
   cd python-msdos
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento local:**
   ```bash
   npm run dev
   ```

4. Abra o navegador no endereço indicado (geralmente `http://localhost:3000`) e divirta-se criando seus próprios jogos!

---

*Desenvolvido com carinho e precisão técnica. Sinta-se livre para criar novas salas, implementar novas rotinas gráficas e expandir as fronteiras do desenvolvimento de jogos retro! 🎮*
