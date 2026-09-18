export interface LibraryItem {
  name: string;
  category: 'cenario' | 'atores' | 'comportamento' | 'eventos' | 'controle' | 'funcoes' | 'propriedades' | 'cores';
  syntax: string;
  desc: string;
  example: string;
}

export const MICROCONDA_LIBRARY: LibraryItem[] = [
  {name:'Tela',category:'cenario',syntax:'tela 160x120',desc:'Define a resolução lógica do jogo.',example:'tela 40x25'},
  {name:'Fundo',category:'cenario',syntax:'fundo preto',desc:'Define a cor de fundo.',example:'fundo azul'},
  {name:'Ator',category:'atores',syntax:'ator Nome ... fim',desc:'Cria um ator do jogo.',example:'ator Jogador\n  desenho quadrado 2, verde\nfim'},
  {name:'Desenho',category:'atores',syntax:'desenho quadrado TAM, COR',desc:'Define uma forma visual para o ator.',example:'desenho circulo 3, amarelo'},
  {name:'Posição',category:'atores',syntax:'posição X, Y',desc:'Define a posição inicial do ator.',example:'posição 20, 12'},
  {name:'Velocidade',category:'comportamento',syntax:'velocidade VX, VY',desc:'Define a velocidade do ator.',example:'velocidade 0, 1'},
  {name:'Controle',category:'controle',syntax:'controlado por setas',desc:'Liga o ator aos controles de teclado.',example:'controlado por setas'},
  {name:'Limite',category:'controle',syntax:'limita à tela',desc:'Mantém o ator dentro da tela.',example:'limita à tela'},
  {name:'Colisão',category:'eventos',syntax:'quando colide com "Nome": ... fim',desc:'Executa ações quando dois atores colidem.',example:'quando colide com "Alvo":\n  diga "Acertou!"\nfim'},
  {name:'Atualização',category:'eventos',syntax:'quando atualiza: ... fim',desc:'Executa ações a cada quadro.',example:'quando atualiza:\n  diga "Executando"\nfim'},
  {name:'Tecla',category:'controle',syntax:'tecla("esquerda")',desc:'Consulta o estado de uma tecla.',example:'tecla("espaco")'},
  {name:'Aleatório',category:'funcoes',syntax:'aleatorio(min, max)',desc:'Gera um inteiro aleatório no intervalo.',example:'numero recebe aleatorio(1, 10)'},
  {name:'Tempo',category:'funcoes',syntax:'tempo()',desc:'Retorna o tempo de execução em segundos.',example:'segundos recebe tempo()'},
  {name:'Persistência',category:'funcoes',syntax:'gravar("chave", valor) / carregar("chave", padrao)',desc:'Salva e recupera dados no armazenamento local do navegador.',example:'gravar("pontos", 100)'},
  {name:'Cores',category:'cores',syntax:'preto, azul, verde, ciano, vermelho, amarelo, branco...',desc:'Paleta de cores suportada pelo runtime.',example:'desenho quadrado 2, verde'}
];
