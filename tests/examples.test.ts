import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { tokenize } from '../src/lexer.ts';
import { parse } from '../src/parser.ts';
import { Game } from '../src/runtime/game.ts';

describe('Exemplos da Linguagem MicroConda', () => {
  const EXAMPLE_FILES = [
    'hello.micro',
    'movement.micro',
    'pong.micro',
    'nave.micro',
    'breakout.micro',
    'tetris.micro',
    'geometric_run.micro'
  ];

  it.each(EXAMPLE_FILES)('faz smoke test de 60 frames para %s sem erro', (filename) => {
    const filePath = path.resolve(process.cwd(), 'examples', filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    const ast = parse(tokenize(content));
    const game = new Game(ast);
    for (let i = 0; i < 60; i++) {
      game.step();
    }
    expect(game.interpreter.currentActor).toBeUndefined();
  });
  it('faz parse e executa steps de examples/pong.micro', () => {
    const filePath = path.resolve(process.cwd(), 'examples/pong.micro');
    const content = fs.readFileSync(filePath, 'utf-8');

    const tokens = tokenize(content);
    expect(tokens.length).toBeGreaterThan(0);

    const ast = parse(tokens);
    expect(ast.screenWidth).toBe(40);
    expect(ast.screenHeight).toBe(30);
    expect(ast.actors.length).toBe(3); // Jogador1, Jogador2, Bola

    const game = new Game(ast);
    expect(game.actors.size).toBe(3);

    // Run 10 simulation frames
    for (let i = 0; i < 10; i++) {
      game.step();
    }
  });

  it('faz parse e executa steps de examples/nave.micro', () => {
    const filePath = path.resolve(process.cwd(), 'examples/nave.micro');
    const content = fs.readFileSync(filePath, 'utf-8');

    const tokens = tokenize(content);
    const ast = parse(tokens);
    expect(ast.actors.length).toBe(4); // Nave, Laser, Inimigo, Estrela

    const game = new Game(ast);
    for (let i = 0; i < 10; i++) {
      game.step();
    }
  });

  it('faz parse e executa steps de examples/breakout.micro', () => {
    const filePath = path.resolve(process.cwd(), 'examples/breakout.micro');
    const content = fs.readFileSync(filePath, 'utf-8');

    const tokens = tokenize(content);
    const ast = parse(tokens);
    expect(ast.actors.length).toBe(5); // Paleta, Bola, Bloco1, Bloco2, Bloco3

    const game = new Game(ast);
    for (let i = 0; i < 10; i++) {
      game.step();
    }
  });

  it('faz parse e executa steps de examples/tetris.micro', () => {
    const filePath = path.resolve(process.cwd(), 'examples/tetris.micro');
    const content = fs.readFileSync(filePath, 'utf-8');

    const tokens = tokenize(content);
    const ast = parse(tokens);
    expect(ast.actors.length).toBe(6); // BordaEsq, BordaDir, Chao, Pilha1, Pilha2, Peca

    const game = new Game(ast);
    for (let i = 0; i < 10; i++) {
      game.step();
    }
  });

  it('faz parse e executa steps de examples/geometric_run.micro', () => {
    const filePath = path.resolve(process.cwd(), 'examples/geometric_run.micro');
    const content = fs.readFileSync(filePath, 'utf-8');

    const tokens = tokenize(content);
    const ast = parse(tokens);
    expect(ast.actors.length).toBe(4); // Chao, Jogador, Obstaculo, EstrelaNeon

    const game = new Game(ast);
    for (let i = 0; i < 20; i++) {
      game.step();
    }
  });
});
