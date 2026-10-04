import { describe, expect, it } from 'vitest';
import { SymbolicEngine } from '../src/agent/symbolic-engine.ts';

describe('Motor simbólico do Bit Agent', () => {
  it('aprende e consulta fatos', () => {
    const engine = new SymbolicEngine();
    engine.clearMemory();

    expect(engine.handle('Meu nome é Thiago').changed).toBe(true);
    expect(engine.handle('Qual é meu nome?').reply).toContain('Thiago');

    engine.handle('Meu cachorro se chama Thor');
    expect(engine.handle('Como se chama meu cachorro?').reply).toContain('Thor');
  });

  it('aprende alias e permite corrigir ou esquecer relações', () => {
    const engine = new SymbolicEngine();
    engine.clearMemory();

    engine.handle('Quando eu disser "Guinho", estou falando do meu chatbot.');
    engine.handle('Guinho é um chatbot');
    engine.handle('Corrija: Guinho é um assistente');
    expect(engine.handle('O que é Guinho?').reply).toContain('assistente');

    engine.handle('Esqueça que Guinho é um assistente');
    expect(engine.handle('O que é Guinho?').reply).toContain('não encontrei');
  });

  it('cria relações no grafo de conhecimento', () => {
    const engine = new SymbolicEngine();
    engine.clearMemory();

    engine.handle('Guinho é meu chatbot');
    engine.handle('Guinho usa servidor');

    expect(engine.handle('O que é Guinho?').reply).toContain('chatbot');
    expect(engine.handle('O Guinho usa servidor?').reply).toBe('Sim.');
  });

  it('preserva contexto em respostas curtas durante diagnóstico', () => {
    const engine = new SymbolicEngine();
    engine.clearMemory();

    expect(engine.handle('Meu servidor caiu.').reply).toContain('respondendo');
    expect(engine.handle('Não').reply).toContain('processo');
    expect(engine.handle('Não').reply).toContain('iniciar');
    expect(engine.handle('Não').reply).toContain('logs');
  });

  it('calcula expressões sem executar JavaScript arbitrário', () => {
    const engine = new SymbolicEngine();
    engine.clearMemory();

    expect(engine.handle('Calcule 2 + 3 * 4').reply).toContain('14');
    expect(engine.handle('Calcule process.exit()').reply).toContain('Não consegui');
  });
});
