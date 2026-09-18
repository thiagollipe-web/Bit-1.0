# MicroConda — Referência da Linguagem

MicroConda é uma linguagem textual em português para criação de jogos 2D.

## Programa mínimo

```microconda
tela 40x25
fundo preto

ator Jogador
  desenho quadrado 2, verde
  posição 19, 12
  controlado por setas
  limita à tela
fim
```

## Atores

`ator`, `desenho`, `posição`, `velocidade`, `controlado por`, `limita à tela` e `quica nas bordas`.

## Lógica

`se ... então ... senão ... fim`, `repita`, `enquanto`, `função`, `retorne`, `diga` e `vira`.

## Eventos

`quando atualiza` e `quando colide com "Nome"`.

## Funções

`aleatorio`, `distancia`, `colide`, `tecla`, `toque`, `tempo`, `limitar`, `interpolar`, `potencia`, `angulo`, `mouse_x`, `mouse_y`, `gravar`, `carregar`, `tocar_som` e `bip`.

Os projetos do Studio usam a extensão `.micro`.
