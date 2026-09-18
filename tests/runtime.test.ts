import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/lexer.ts';
import { parse } from '../src/parser.ts';
import { Game } from '../src/runtime/game.ts';
import { checkAABB } from '../src/runtime/collision.ts';

describe('Runtime - Atores, Quique e Pontuação de Pong', () => {
  it('permite que a bola saia da tela na horizontal para pontuar quando quique é vertical', () => {
    const code = `
      tela 160x120
      fundo preto

      pontos2 recebe 0

      ator Bola
        desenho quadrado 4, branco
        posição 1, 50
        velocidade -5, 0
        quica nas bordas verticais
        quando atualiza:
          se x < 0 então
            pontos2 recebe pontos2 + 1
          fim
        fim
      fim
    `;
    const ast = parse(tokenize(code));
    const game = new Game(ast);

    const bola = game.actors.get('bola')!;
    expect(bola.x).toBe(1);

    // Step 1 frame
    game.step();

    // The ball must have moved to 1 - 5 = -4, WITHOUT being clamped to 0!
    expect(bola.x).toBeLessThan(0);
    // And the point was scored!
    expect(game.interpreter.globalEnv.get('pontos2')).toBe(1);
  });

  it('quica nas bordas verticais inverte velocidade vertical sem prender o ator', () => {
    const code = `
      tela 160x120
      fundo preto

      ator Bola
        desenho quadrado 4, branco
        posição 50, 2
        velocidade 0, -4
        quica nas bordas verticais
      fim
    `;
    const ast = parse(tokenize(code));
    const game = new Game(ast);
    const bola = game.actors.get('bola')!;

    // Step: moves to 2 - 4 = -2, hits top border (y <= 0)
    game.step();

    expect(bola.y).toBe(0);
    expect(bola.vy).toBeGreaterThan(0); // vy inverted to positive!
  });

  it('limita à tela impede que o jogador saia dos limites', () => {
    const code = `
      tela 160x120

      ator Raquete
        desenho retângulo 4, 20, branco
        posição 10, 115
        velocidade 0, 10
        limita à tela
      fim
    `;
    const ast = parse(tokenize(code));
    const game = new Game(ast);
    const raquete = game.actors.get('raquete')!;

    // Attempt to move past bottom (115 + 10 = 125, but max is 120 - 20 = 100)
    game.step();

    expect(raquete.y).toBe(100);
  });

  it('detecta colisão AABB entre dois atores', () => {
    const boxA = { x: 10, y: 10, width: 20, height: 20 };
    const boxB = { x: 25, y: 25, width: 20, height: 20 };
    const boxC = { x: 60, y: 60, width: 20, height: 20 };

    expect(checkAABB(boxA, boxB)).toBe(true);
    expect(checkAABB(boxA, boxC)).toBe(false);
  });

  it('dispara eventos de colisão entre atores', () => {
    const code = `
      tela 160x120
      bateu recebe 0

      ator Bola
        desenho quadrado 4, branco
        posição 20, 20
        quando colide com "Bloco":
          bateu recebe 1
        fim
      fim

      ator Bloco
        desenho retângulo 10, 10, vermelho
        posição 22, 22
      fim
    `;
    const ast = parse(tokenize(code));
    const game = new Game(ast);

    game.step();
    expect(game.interpreter.globalEnv.get('bateu')).toBe(1);
  });
  it('move ator controlado pelas setas sem escalar velocidade por frame', () => {
    const ast = parse(tokenize(`
      tela 40x25
      ator Jogador
        desenho quadrado 2, verde
        posição 10, 10
        controlado por setas
        limita à tela
      fim
    `));
    const game = new Game(ast);
    const jogador = game.actors.get('jogador')!;
    game.handleKeyDown('ArrowRight');
    game.step();
    expect(jogador.x).toBe(12);
    game.step();
    expect(jogador.x).toBe(14);
    game.handleKeyUp('ArrowRight');
    game.step();
    expect(jogador.x).toBe(14);
  });

  it('controle por toque posiciona o ator no ponto lógico do toque', () => {
    const ast = parse(tokenize(`
      tela 40x25
      ator Jogador
        desenho quadrado 4, verde
        posição 5, 5
        controlado por toque
        limita à tela
      fim
    `));
    const game = new Game(ast);
    const jogador = game.actors.get('jogador')!;
    game.handleTouch(20, 12, true);
    game.step();
    expect(jogador.x).toBe(18);
    expect(jogador.y).toBe(10);
    game.handleTouch(undefined, undefined, false);
    game.step();
    expect(jogador.x).toBe(18);
    expect(jogador.y).toBe(10);
  });

  it('mouse controla o ator pelo ponto lógico informado', () => {
    const ast = parse(tokenize(`
      tela 40x25
      ator Mira
        desenho quadrado 4, azul
        posição 5, 5
        controlado por mouse
        limita à tela
      fim
    `));
    const game = new Game(ast);
    const mira = game.actors.get('mira')!;
    game.handleTouch(30, 20, false);
    game.step();
    expect(mira.x).toBe(28);
    expect(mira.y).toBe(18);
  });


  it('não deixa listeners registrados quando a construção do jogo falha', () => {
    const ast = parse(tokenize(`
      tela 40x25
      ator A
        desenho quadrado 2, branco
        posição 10, 10
        desconhecida
      fim
    `));

    const listeners = new Map<string, number>();
    const originalWindow = (globalThis as { window?: unknown }).window;
    const originalDocument = (globalThis as { document?: unknown }).document;

    const fakeTarget = {
      addEventListener(type: string) {
        listeners.set(type, (listeners.get(type) ?? 0) + 1);
      },
      removeEventListener(type: string) {
        listeners.set(type, Math.max(0, (listeners.get(type) ?? 0) - 1));
      }
    };

    (globalThis as { window?: unknown }).window = fakeTarget;
    (globalThis as { document?: unknown }).document = {
      activeElement: null
    };

    expect(() => new Game(ast)).toThrow();

    expect([...listeners.values()].every(count => count === 0)).toBe(true);

    (globalThis as { window?: unknown }).window = originalWindow;
    (globalThis as { document?: unknown }).document = originalDocument;
  });

  it('limpa o input ao parar o jogo para evitar tecla travada ao reiniciar', () => {
    const ast = parse(tokenize(`
      tela 40x25
      ator Jogador
        desenho quadrado 2, verde
        posição 10, 10
        controlado por setas
        limita à tela
      fim
    `));
    const game = new Game(ast);
    game.handleKeyDown('ArrowRight');
    game.handleTouch(20, 10, true);
    game.stop();
    expect(game.keysDown.size).toBe(0);
    expect(game.input.right).toBe(false);
    expect(game.input.touchActive).toBe(false);
  });

  it('restaura currentActor mesmo quando um evento lança erro', () => {
    const ast = parse(tokenize(`
      tela 40x25
      ator A
        desenho quadrado 4, branco
        posição 10, 10
        quando atualiza:
          desconhecida
        fim
      fim
    `));
    const game = new Game(ast);
    expect(() => game.step()).toThrow();
    expect(game.interpreter.currentActor).toBeUndefined();
  });


  it('encerra o loop com segurança quando um evento de frame lança erro', () => {
    const ast = parse(tokenize(`
      tela 40x25
      ator A
        desenho quadrado 2, branco
        posição 10, 10
        quando atualiza:
          desconhecida
        fim
      fim
    `));
    const game = new Game(ast);
    const raf = globalThis.requestAnimationFrame;
    const cancel = globalThis.cancelAnimationFrame;
    const originalWindow = (globalThis as { window?: unknown }).window;
    let pendingFrame: number | null = null;
    const originalLogs = game.logs.length;

    (globalThis as { requestAnimationFrame?: typeof requestAnimationFrame }).requestAnimationFrame = ((cb: FrameRequestCallback) => {
      const id = 1;
      pendingFrame = id;
      cb(0);
      return id;
    }) as typeof requestAnimationFrame;
    (globalThis as { cancelAnimationFrame?: typeof cancelAnimationFrame }).cancelAnimationFrame = ((id: number) => { pendingFrame = id; }) as typeof cancelAnimationFrame;
    (globalThis as { window?: unknown }).window = {
      addEventListener() {},
      removeEventListener() {}
    };

    game.start();

    expect(game.running).toBe(false);
    expect(game.animationFrameId).toBeNull();
    expect(game.logs.length).toBeGreaterThan(originalLogs);
    expect(pendingFrame).toBe(1);

    (globalThis as { requestAnimationFrame?: typeof requestAnimationFrame }).requestAnimationFrame = raf;
    (globalThis as { cancelAnimationFrame?: typeof cancelAnimationFrame }).cancelAnimationFrame = cancel;
    (globalThis as { window?: unknown }).window = originalWindow;
  });

  it('aceita propriedades de outro ator em eventos do ator atual', () => {
    const ast = parse(tokenize(`
      tela 40x25
      ator Alvo
        desenho quadrado 2, verde
        posição 10, 10
      fim
      ator Observador
        desenho quadrado 2, branco
        posição 20, 10
        quando atualiza:
          x recebe Alvo.x + 5
        fim
      fim
    `));
    const game = new Game(ast);
    game.step();
    expect(game.actors.get('observador')!.x).toBe(15);
  });

});
