import { describe, it, expect } from 'vitest';
import { MICROCONDA_LIBRARY } from '../src/library-data.ts';
import { criarJogoMicroConda } from '../src/index.ts';

describe('Biblioteca do MicroConda', () => {
  it('contém todos os comandos e categorias principais', () => {
    expect(MICROCONDA_LIBRARY.length).toBeGreaterThan(8);

    const categories = new Set(MICROCONDA_LIBRARY.map((item) => item.category));
    expect(categories.has('cenario')).toBe(true);
    expect(categories.has('atores')).toBe(true);
    expect(categories.has('comportamento')).toBe(true);
    expect(categories.has('eventos')).toBe(true);
    expect(categories.has('controle')).toBe(true);
    expect(categories.has('funcoes')).toBe(true);
    expect(categories.has('cores')).toBe(true);
  });

  it('todos os itens possuem sintaxe, descrição e exemplo válidos', () => {
    for (const item of MICROCONDA_LIBRARY) {
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.syntax.length).toBeGreaterThan(0);
      expect(item.desc.length).toBeGreaterThan(0);
      expect(item.example.length).toBeGreaterThan(0);
    }
  });

  it('exporta criarJogoMicroConda pela biblioteca pública index.ts', () => {
    const { game, ast } = criarJogoMicroConda(`tela 160x120\nfundo preto\nator Teste\n  desenho quadrado 4, branco\n  posição 10, 10\nfim`);
    expect(ast.screenWidth).toBe(160);
    expect(ast.screenHeight).toBe(120);
    expect(game.actors.size).toBe(1);
    game.step();
  });
});
