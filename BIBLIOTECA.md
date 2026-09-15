# 📚 Biblioteca BIT 1.2 - Referência Completa

## 📖 Índice
- [Cenário & Configuração](#cenário--configuração)
- [Atores](#atores)
- [Comportamentos Automáticos](#comportamentos-automáticos)
- [Eventos](#eventos)
- [Controle de Fluxo](#controle-de-fluxo)
- [Funções Nativas (Built-ins)](#funções-nativas-built-ins)
- [Propriedades dos Atores](#propriedades-dos-atores)
- [Cores Suportadas](#cores-suportadas)

---

## Cenário & Configuração

### `tela LARGURAxALTURA`
Define a resolução nativa da tela do jogo para estética pixel art.

**Exemplo:**
```bit
tela 160x120
```

---

### `fundo COR`
Define a cor de fundo do cenário do jogo.

**Exemplo:**
```bit
fundo preto
fundo azul
```

---

### `VARIAVEL recebe VALOR`
Cria uma variável ou atualiza seu valor.

**Exemplo:**
```bit
pontos recebe 0
vidas recebe 3
pontos recebe pontos + 10
```

---

### `diga EXPRESSAO`
Exibe uma mensagem ou valor no console do jogo.

**Exemplo:**
```bit
diga "Jogo Iniciado!"
diga "Pontos: " + pontos
diga vidas
```

---

## Atores

### `ator NomeDoAtor ... fim`
Declara um novo ator/objeto com seus atributos visuais e comportamentos.

**Exemplo:**
```bit
ator Jogador
  desenho quadrado 8, verde
  posição 76, 56
  velocidade 0, 0
  controlado por setas
  limita à tela
  
  quando atualiza:
    diga "Jogador se movimentando"
  fim
  
  quando colide com "Inimigo":
    diga "Bateu no inimigo!"
  fim
fim
```

---

### `desenho quadrado TAMANHO, COR`
Define o formato visual do ator como um quadrado.

**Exemplo:**
```bit
desenho quadrado 8, azul
desenho quadrado 16, amarelo
```

---

### `desenho retângulo LARGURA, ALTURA, COR`
Define o formato visual do ator como um retângulo.

**Exemplo:**
```bit
desenho retângulo 20, 6, vermelho
desenho retângulo 32, 8, verde
```

---

### `posição X, Y`
Posiciona o ator nas coordenadas iniciais X e Y da tela.

**Exemplo:**
```bit
posição 80, 60
posição 0, 0
```

---

### `velocidade VX, VY`
Aplica velocidade contínua aos eixos horizontal (vx) e vertical (vy).

**Exemplo:**
```bit
velocidade 2, 1.5
velocidade -1, 0
```

---

## Comportamentos Automáticos

### `controlado por setas`
Permite controlar o ator automaticamente usando as setas do teclado.

**Exemplo:**
```bit
ator Nave
  desenho retângulo 10, 6, ciano
  posição 75, 100
  controlado por setas
  limita à tela
fim
```

---

### `limita à tela`
Impede o ator de ultrapassar as quatro bordas da tela.

**Exemplo:**
```bit
ator Jogador
  desenho quadrado 8, verde
  posição 10, 10
  velocidade 2, 2
  limita à tela
fim
```

---

### `quica nas bordas`
Faz o ator rebater automaticamente ao encostar em qualquer uma das quatro bordas.

**Exemplo:**
```bit
ator Bola
  desenho quadrado 4, branco
  posição 80, 60
  velocidade 3, 2
  quica nas bordas
fim
```

---

### `quica nas bordas horizontais`
Rebate a velocidade horizontal (vx) ao atingir os limites esquerdo e direito.

**Exemplo:**
```bit
ator Bola
  desenho quadrado 4, branco
  quica nas bordas horizontais
fim
```

---

### `quica nas bordas verticais`
Rebate a velocidade vertical (vy) ao atingir o teto e o chão.

**Exemplo:**
```bit
ator Bola
  desenho quadrado 4, branco
  quica nas bordas verticais
fim
```

---

## Eventos

### `quando atualiza: ... fim`
Bloco executado repetidamente a cada quadro de animação (game loop).

**Exemplo:**
```bit
ator Jogador
  desenho quadrado 8, azul
  
  quando atualiza:
    se x > 160 então
      x recebe 0
    fim
    diga "Frame atualizado"
  fim
fim
```

---

### `quando colide com "NomeDoOutroAtor": ... fim`
Executado no momento exato em que o ator colide com outro ator especificado.

**Exemplo:**
```bit
ator Jogador
  desenho quadrado 8, verde
  
  quando colide com "Moeda":
    pontos recebe pontos + 1
    diga "Pegou a moeda!"
  fim
fim
```

---

## Controle de Fluxo

### `se CONDIÇÃO então ... fim`
Executa comandos se a condição for verdadeira.

**Exemplo:**
```bit
se vidas <= 0 então
  diga "Fim de Jogo!"
fim

se x > 150 então
  x recebe 0
fim
```

---

### `se ... senão se ... senão ... fim`
Cria ramificações alternativas para testar múltiplas condições.

**Exemplo:**
```bit
se pontos > 100 então
  diga "Excelente!"
senão se pontos > 50 então
  diga "Bom!"
senão
  diga "Continue jogando"
fim
```

---

### `repita QUANTIDADE vezes ... fim`
Executa um bloco de comandos o número determinado de vezes.

**Exemplo:**
```bit
repita 5 vezes
  diga "Contagem!"
fim

repita 3 vezes
  x recebe x + 10
fim
```

---

### `enquanto CONDIÇÃO faça ... fim`
Repete o bloco de código enquanto a condição permanecer verdadeira.

**Exemplo:**
```bit
enquanto contagem > 0 faça
  contagem recebe contagem - 1
  diga contagem
fim

enquanto vivo faça
  se tecla("espaco") então
    diga "Tiro!"
  fim
fim
```

---

## Funções Nativas (Built-ins)

### `aleatorio(min, max)` / `aleatório(min, max)`
Retorna um número inteiro pseudo-aleatório entre min e max (inclusive).

**Exemplo:**
```bit
x recebe aleatorio(10, 150)
inimigo_x recebe aleatório(0, 160)
tipo recebe aleatorio(1, 3)
```

---

### `distancia(x1, y1, x2, y2)`
Calcula a distância euclidiana entre dois pontos.

**Exemplo:**
```bit
d recebe distancia(x, y, Inimigo.x, Inimigo.y)

se distancia(Jogador.x, Jogador.y, Inimigo.x, Inimigo.y) < 16 então
  diga "Muito perto!"
fim
```

---

### `tecla("nome")`
Retorna verdadeiro se a tecla informada estiver pressionada.

**Teclas suportadas:**
- `"arrowup"`, `"arrowdown"`, `"arrowleft"`, `"arrowright"` (setas)
- `"espaco"`, `"space"`
- `"a"`, `"w"`, `"s"`, `"d"` (letras)
- `"enter"`, `"shift"`, `"ctrl"`, `"alt"`
- Qualquer tecla letra ou número em minúsculas

**Exemplo:**
```bit
se tecla("espaco") então
  diga "Tiro disparado!"
fim

se tecla("w") então
  y recebe y - 1
fim
```

---

### `toque()`
Retorna verdadeiro se a tela do celular ou tablet estiver sendo tocada.

**Exemplo:**
```bit
se toque() então
  y recebe y - 1
  diga "Tocado!"
fim
```

---

### `tempo()`
Retorna o tempo decorrido desde o início da execução em segundos.

**Exemplo:**
```bit
segundos recebe tempo()
diga "Tempo: " + tempo()

se tempo() > 60 então
  diga "1 minuto passou!"
fim
```

---

### `seno(angulo)` / `cosseno(angulo)`
Calcula o seno ou cosseno trigonométrico para o ângulo informado em graus.

**Exemplo:**
```bit
offset recebe seno(tempo() * 60) * 10
y recebe 60 + offset

valor recebe cosseno(45)
```

---

### `raiz(numero)`
Calcula a raiz quadrada de um número.

**Exemplo:**
```bit
r recebe raiz(16)
diga r

lado recebe raiz(area)
```

---

### `absoluto(numero)`
Retorna o módulo (valor positivo absoluto) de um número.

**Exemplo:**
```bit
distX recebe absoluto(x - Inimigo.x)
diferenca recebe absoluto(vx)
```

---

### `piso(v)` / `teto(v)` / `arredonda(v)`
Funções de arredondamento:
- **piso(v)**: Arredonda para baixo
- **teto(v)**: Arredonda para cima
- **arredonda(v)**: Arredonda para o inteiro mais próximo

**Exemplo:**
```bit
inteiro recebe piso(3.8)
diga inteiro

maior recebe teto(2.1)
aproximado recebe arredonda(3.6)
```

---

### `colide(ator1, ator2)`
Verifica se dois atores estão colidindo.

**Exemplo:**
```bit
se colide(Jogador, Inimigo) então
  diga "Colisão detectada!"
fim
```

---

## Propriedades dos Atores

### `x` / `y`
Coordenadas horizontais e verticais do ator no plano 2D.

**Exemplo:**
```bit
x recebe x + 2
Inimigo.y recebe 10
diga Jogador.x
```

---

### `vx` / `vy`
Velocidade vetorial nos eixos X e Y aplicada automaticamente a cada quadro.

**Exemplo:**
```bit
vx recebe -1.5
vy recebe 0
Bola.vx recebe Bola.vx * -1
```

---

### `largura` / `altura`
Dimensões dinâmicas do ator em pixels.

**Exemplo:**
```bit
largura recebe 24
altura recebe 8
diga Jogador.largura
```

---

### `ativo`
Indica se o ator está visível e participando das colisões (verdadeiro/falso).

**Exemplo:**
```bit
ativo recebe falso
Moeda.ativo recebe verdadeiro

se Inimigo.ativo então
  diga "Inimigo ainda está ativo"
fim
```

---

## Cores Suportadas

Paleta padrão integrada de cores 8-bit pré-definidas:

- **preto** - #000000
- **branco** - #FFFFFF
- **vermelho** - #FF0000
- **verde** - #00FF00
- **azul** - #0000FF
- **amarelo** - #FFFF00
- **ciano** - #00FFFF
- **magenta** - #FF00FF
- **cinza** - #808080
- **laranja** - #FFA500
- **roxo** - #800080
- **rosa** - #FFC0CB
- **marrom** - #A52A2A
- **invisivel** - Transparente

**Exemplo:**
```bit
fundo azul
desenho quadrado 10, amarelo
desenho retângulo 20, 10, verde
```

---

## 🎮 Operadores Disponíveis

### Aritméticos
- `+` Adição
- `-` Subtração
- `*` Multiplicação
- `/` Divisão
- `%` Módulo (resto da divisão)

### Comparadores
- `==` Igual
- `!=` Diferente
- `<` Menor
- `>` Maior
- `<=` Menor ou igual
- `>=` Maior ou igual

### Lógicos
- `e` / `and` - E lógico
- `ou` / `or` - OU lógico
- `nao` / `not` - Negação

**Exemplo:**
```bit
se x > 100 e y < 50 então
  diga "Posição especial"
fim

se vidas <= 0 ou pontos == 0 então
  diga "Jogo acabou"
fim
```

---

## 📝 Estrutura Básica de um Programa BIT

```bit
# Configuração da tela
tela 160x120
fundo preto

# Variáveis globais
pontos recebe 0
vidas recebe 3

# Definição de atores
ator Jogador
  desenho quadrado 8, verde
  posição 75, 100
  controlado por setas
  limita à tela
  
  quando colide com "Inimigo":
    vidas recebe vidas - 1
    diga "Ouch! Vidas: " + vidas
  fim
fim

ator Inimigo
  desenho quadrado 8, vermelho
  posição 80, 20
  velocidade 1, 1
  quica nas bordas
fim

ator Moeda
  desenho quadrado 4, amarelo
  posição aleatorio(10, 150), aleatorio(10, 100)
  
  quando colide com "Jogador":
    pontos recebe pontos + 1
    diga "Pontos: " + pontos
  fim
fim
```

---

## ⚡ Dicas de Desenvolvimento

1. **Use `diga` para debug** - Veja os valores das variáveis no console
2. **Comece simples** - Crie um ator e teste seu movimento
3. **Use templates** - A IDE oferece templates de jogo prontos
4. **Consulte a Biblioteca** - Clique no botão "📚 Biblioteca" na IDE
5. **Teste exemplos** - Estude os exemplos (Tetris, Pong, etc.)

---

## 🔗 Recursos Úteis

- **IDE Online**: https://thiagollipe-web.github.io/Bit-1.0/
- **Repositório**: https://github.com/thiagollipe-web/Bit-1.0
- **Exemplos**: Tetris, Pong, Nave, Breakout
- **Versão**: BIT 1.2.0

---

**Linguagem de programação brasileira para criação de jogos 2D acessíveis!** 🎮✨
