export interface LibraryItem {
  name: string;
  category: 'cenario' | 'atores' | 'comportamento' | 'eventos' | 'controle' | 'funcoes' | 'propriedades' | 'cores';
  syntax: string;
  desc: string;
  example: string;
}

export const BIT_LIBRARY: LibraryItem[] = [
  // Cenário & Configuração
  {
    name: 'game.init',
    category: 'cenario',
    syntax: 'game.init(colunas, linhas, titulo)',
    desc: 'Inicializa o terminal MS-DOS com as dimensões de grade (padrão 40x25 ou customizado) e o título da janela.',
    example: 'import game\n\ngame.init(width=40, height=25, title="MEU JOGO RETRO")'
  },
  {
    name: 'game.clear',
    category: 'cenario',
    syntax: 'game.clear(cor)',
    desc: 'Limpa a tela do terminal inteira, preenchendo o plano de fundo com a cor selecionada (padrão "black").',
    example: 'game.clear("black")'
  },
  {
    name: 'game.log',
    category: 'cenario',
    syntax: 'game.log(mensagem)',
    desc: 'Exibe uma string de mensagem ou logs no painel inferior do sistema, simulando o prompt do DOS.',
    example: 'game.log(f"Pontuação atualizada: {pontos}")'
  },

  // Desenho / Arte
  {
    name: 'game.draw',
    category: 'atores',
    syntax: 'game.draw(x, y, texto_ou_ascii, cor)',
    desc: 'Desenha um caractere ou uma arte ASCII multi-linha nas coordenadas de grade (X: coluna, Y: linha). Se a string contiver quebras de linha (\\n), o motor desenha cada linha sequencialmente.',
    example: 'game.draw(18, 12, "😎", "green_bright")\n# Para ASCII multi-linha:\ngame.draw(5, 5, " ▲ \\n■■■", "cyan")'
  },

  // Ações / Áudio
  {
    name: 'game.beep',
    category: 'comportamento',
    syntax: 'game.beep(frequencia, duracao)',
    desc: 'Sintetiza um som clássico de PC Speaker retro (onda quadrada) com frequência em Hz e duração em segundos.',
    example: 'game.beep(440, 0.1) # Beep do PC Speaker em Lá (440Hz)\ngame.beep(150, 0.3) # Som de Game Over ou colisão grave'
  },

  // Eventos & Loops
  {
    name: 'game.loop',
    category: 'eventos',
    syntax: 'game.loop(funcao_de_atualizacao)',
    desc: 'Inicia o loop do jogo registrando a função que o motor deve executar a cada frame (aproximadamente 30/60 fps).',
    example: 'def atualizar():\n    game.clear()\n    game.draw(20, 12, "★", "yellow")\n\ngame.loop(atualizar)'
  },

  // Entradas / Controles
  {
    name: 'game.key',
    category: 'controle',
    syntax: 'game.key(nome_da_tecla)',
    desc: 'Retorna verdadeiro se a tecla informada estiver pressionada. Teclas suportadas: "arrowup" ou "cima", "arrowdown" ou "baixo", "arrowleft" ou "esquerda", "arrowright" ou "direita", "espaco", "enter", "w", "a", "s", "d", "r", etc.',
    example: 'if game.key("arrowleft") or game.key("a"):\n    jogador_x -= 1'
  },

  // Utilitários / Funções
  {
    name: 'game.random',
    category: 'funcoes',
    syntax: 'game.random(min, max)',
    desc: 'Retorna um número inteiro aleatório entre min e max (inclusive). Útil para spawnar itens ou inimigos de forma aleatória.',
    example: 'obstaculo_x = game.random(5, 35)'
  },
  {
    name: 'game.time',
    category: 'funcoes',
    syntax: 'game.time()',
    desc: 'Retorna o tempo de execução decorrido desde o início do jogo em segundos (como um float de alta precisão).',
    example: 'segundos = game.time()\nif segundos % 2 < 1:\n    game.draw(2, 2, "PISCAR", "white")'
  },

  // Cores DOS Suportadas
  {
    name: 'Paleta MS-DOS 16 cores',
    category: 'cores',
    syntax: 'Cores retro disponíveis',
    desc: 'Cores suportadas pelo console MS-DOS: "black" (preto), "blue" (azul), "green" (verde), "cyan" (ciano), "red" (vermelho), "magenta" (rosa escuro), "brown" (marrom/laranja), "gray" (cinza), "dark_gray" (cinza escuro), "blue_bright" (azul claro), "green_bright" (verde claro), "cyan_bright" (ciano claro), "red_bright" (vermelho claro), "magenta_bright" (rosa claro), "yellow" (amarelo), "white" (branco).',
    example: 'game.clear("black")\ngame.draw(10, 10, "ERRO NO DISCO", "red_bright")'
  }
];
