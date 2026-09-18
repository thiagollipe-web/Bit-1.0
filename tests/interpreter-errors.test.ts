import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/lexer.ts';
import { parse } from '../src/parser.ts';
import { createBuiltins } from '../src/interp/builtins.ts';
import { Interpreter, MicroCondaRuntimeError, Environment } from '../src/interp/interpreter.ts';

function run(code: string) {
  const ast = parse(tokenize(code));
  const interpreter = new Interpreter(createBuiltins());
  interpreter.executeBlock(ast.globalStatements, interpreter.globalEnv);
  return interpreter;
}

describe('MicroConda runtime safety', () => {
  it('reports unknown identifiers instead of converting them to zero', () => {
    expect(() => run('resultado recebe inexistente + 1')).toThrow(MicroCondaRuntimeError);
  });

  it('reports division by zero', () => {
    expect(() => run('resultado recebe 10 / 0')).toThrow('Divisão por zero');
  });

  it('reports unknown functions', () => {
    expect(() => run('resultado recebe funcao_que_nao_existe(1)')).toThrow('não existe');
  });

  it('reports wrong function arity', () => {
    expect(() => run('função dobro(n)\n retorne n * 2\nfim\nresultado recebe dobro()')).toThrow('esperava 1 argumento');
  });

  it('keeps short-circuit semantics for logical operators', () => {
    const interpreter = run('resultado recebe falso e inexistente');
    expect(interpreter.globalEnv.get('resultado')).toBe(false);
    const interpreter2 = run('resultado recebe verdadeiro ou inexistente');
    expect(interpreter2.globalEnv.get('resultado')).toBe(true);
  });

  it('does not allow assigning an unknown variable through Environment.assign', () => {
    const env = new Environment();
    expect(() => env.assign('x', 1)).toThrow('não foi criada');
  });
});
