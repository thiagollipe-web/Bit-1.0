# Como usar a BIT pelo Bloco de Notas

## 1. Arquivos

- **BIT.html**: motor da linguagem. Abra no Chrome ou Edge.
- **.bit**: seu programa. Pode ser editado no Bloco de Notas.
- **examples/**: exemplos de jogos.

## 2. Fluxo

1. Abra o **Bloco de Notas**.
2. Escreva ou edite um arquivo com extensão **.bit**.
3. Salve como **UTF-8**.
4. Abra **BIT.html** no navegador.
5. Clique em **Abrir .BIT**.
6. Selecione seu arquivo.
7. Clique em **Executar**.

## 3. Primeiro programa

```bit
tela 320x180
fundo preto

ator Jogador
  desenho quadrado 20, verde
  posição 40, 80
  controlado por setas
  limita à tela
fim

diga "Olá, BIT!"
```

## 4. Importante

O Bloco de Notas edita o código. O navegador executa a linguagem.

Você não precisa instalar Node.js, npm ou Vite para usar o modo standalone.
