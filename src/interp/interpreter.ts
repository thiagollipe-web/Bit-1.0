import { Expr, Stmt } from '../types.ts';
import { Builtin } from './builtins.ts';
import { Actor } from '../runtime/actor.ts';

export class BitRuntimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BitRuntimeError';
  }
}

export class ReturnSignal {
  constructor(public value: unknown) {}
}

export class Environment {
  private values = new Map<string, unknown>();
  readonly parent?: Environment;

  constructor(parent?: Environment) {
    this.parent = parent;
  }

  get(name: string): unknown {
    const key = name.toLowerCase();
    if (this.values.has(key)) return this.values.get(key);
    return this.parent?.get(name);
  }

  set(name: string, value: unknown): void {
    this.values.set(name.toLowerCase(), value);
  }

  assign(name: string, value: unknown): void {
    const key = name.toLowerCase();
    if (this.values.has(key)) {
      this.values.set(key, value);
      return;
    }
    if (this.parent) {
      this.parent.assign(name, value);
      return;
    }
    throw new BitRuntimeError(`A variável "${name}" não foi criada.`);
  }

  has(name: string): boolean {
    const key = name.toLowerCase();
    return this.values.has(key) || !!this.parent?.has(name);
  }
}

export interface UserFunction {
  params: string[];
  body: Stmt[];
  closure: Environment;
}

function numberValue(value: unknown, context: string): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  throw new BitRuntimeError(`${context} precisa ser um número.`);
}

export class Interpreter {
  globalEnv: Environment;
  currentEnv: Environment;
  builtins: Map<string, Builtin>;
  actors: Map<string, Actor>;
  currentActor?: Actor;
  outputLog: string[] = [];
  onSay?: (message: string) => void;
  private instructionCount = 0;
  readonly maxInstructions = 100_000;

  constructor(builtins: Map<string, Builtin>, actors: Map<string, Actor> = new Map()) {
    this.builtins = builtins;
    this.actors = actors;
    this.globalEnv = new Environment();
    this.currentEnv = this.globalEnv;
    for (const [name, actor] of actors.entries()) this.globalEnv.set(name, actor);
  }

  resetBudget(): void {
    this.instructionCount = 0;
  }

  private tick(): void {
    this.instructionCount++;
    if (this.instructionCount > this.maxInstructions) {
      throw new BitRuntimeError('Limite de execução excedido. Verifique laços que podem nunca terminar.');
    }
  }

  evalExpr(expr: Expr, env: Environment = this.currentEnv): unknown {
    this.tick();
    switch (expr.kind) {
      case 'literal':
        return expr.value;

      case 'identifier': {
        const name = expr.name.toLowerCase();
        if (env.has(name)) return env.get(name);
        if (this.actors.has(name)) return this.actors.get(name);

        if (this.currentActor) {
          const actor = this.currentActor;
          if (name === 'x') return actor.x;
          if (name === 'y') return actor.y;
          if (name === 'vx') return actor.vx;
          if (name === 'vy') return actor.vy;
          if (name === 'largura') return actor.width;
          if (name === 'altura') return actor.height;
          if (name === 'cor' && actor.shape) return actor.shape.color;
          if ((name === 'texto' || name === 'text') && actor.shape?.type === 'texto') return actor.shape.text;
          if (name === 'angulo' || name === 'ângulo') return actor.angle;
          if (name === 'visivel' || name === 'visível') return actor.active;
          if (name === 'alfa' || name === 'opacidade') return actor.opacity;
          if (name in actor.props) return actor.props[name];
        }

        throw new BitRuntimeError(`Identificador "${expr.name}" não existe.`);
      }

      case 'binary': {
        if (expr.op === 'e' || expr.op === '&&') {
          const left = Boolean(this.evalExpr(expr.left, env));
          return left && Boolean(this.evalExpr(expr.right, env));
        }
        if (expr.op === 'ou' || expr.op === '||') {
          const left = Boolean(this.evalExpr(expr.left, env));
          return left || Boolean(this.evalExpr(expr.right, env));
        }

        const left = this.evalExpr(expr.left, env);
        const right = this.evalExpr(expr.right, env);
        return this.evalBinary(expr.op, left, right);
      }

      case 'unary': {
        const val = this.evalExpr(expr.expr, env);
        if (expr.op === '-') return -numberValue(val, 'Operação unária');
        if (expr.op === '!' || expr.op === 'nao' || expr.op === 'não') return !val;
        throw new BitRuntimeError(`Operador unário "${expr.op}" não suportado.`);
      }

      case 'member': {
        const obj = this.evalExpr({ kind: 'identifier', name: expr.object }, env);
        const prop = expr.property.toLowerCase();

        if (obj instanceof Actor) {
          if (prop === 'x') return obj.x;
          if (prop === 'y') return obj.y;
          if (prop === 'vx') return obj.vx;
          if (prop === 'vy') return obj.vy;
          if (prop === 'largura') return obj.width;
          if (prop === 'altura') return obj.height;
          if (prop === 'ativo' || prop === 'visivel' || prop === 'visível') return obj.active;
          if (prop === 'cor' && obj.shape) return obj.shape.color;
          if ((prop === 'texto' || prop === 'text') && obj.shape?.type === 'texto') return obj.shape.text;
          if (prop === 'angulo' || prop === 'ângulo') return obj.angle;
          if (prop === 'alfa' || prop === 'opacidade') return obj.opacity;
          if (prop in obj.props) return obj.props[prop];
          throw new BitRuntimeError(`A propriedade "${expr.property}" não existe no ator "${obj.name}".`);
        }

        if (obj && typeof obj === 'object') {
          const key = Object.keys(obj as object).find(k => k.toLowerCase() === prop);
          if (key) return (obj as Record<string, unknown>)[key];
        }

        throw new BitRuntimeError(`Não é possível acessar a propriedade "${expr.property}".`);
      }

      case 'call': {
        const calleeName = expr.callee.toLowerCase();
        const args = expr.args.map(a => this.evalExpr(a, env));

        if (this.builtins.has(calleeName)) {
          return this.builtins.get(calleeName)!(args);
        }

        const userFn = env.get(calleeName) as UserFunction | undefined;
        if (!userFn || !userFn.params || !userFn.body) {
          throw new BitRuntimeError(`A função "${expr.callee}" não existe.`);
        }

        if (args.length !== userFn.params.length) {
          throw new BitRuntimeError(
            `A função "${expr.callee}" esperava ${userFn.params.length} argumento(s), mas recebeu ${args.length}.`
          );
        }

        const callEnv = new Environment(userFn.closure);
        userFn.params.forEach((param, idx) => callEnv.set(param, args[idx]));
        const prevEnv = this.currentEnv;
        this.currentEnv = callEnv;
        try {
          this.executeBlock(userFn.body, callEnv);
        } catch (error) {
          if (error instanceof ReturnSignal) return error.value;
          throw error;
        } finally {
          this.currentEnv = prevEnv;
        }
        return undefined;
      }
    }
  }

  private evalBinary(op: string, left: unknown, right: unknown): unknown {
    switch (op) {
      case '+':
        if (typeof left === 'string' || typeof right === 'string') {
          return String(left ?? '') + String(right ?? '');
        }
        return numberValue(left, 'Soma') + numberValue(right, 'Soma');
      case '-':
        return numberValue(left, 'Subtração') - numberValue(right, 'Subtração');
      case '*':
        return numberValue(left, 'Multiplicação') * numberValue(right, 'Multiplicação');
      case '/': {
        const divisor = numberValue(right, 'Divisão');
        if (divisor === 0) throw new BitRuntimeError('Divisão por zero não é permitida.');
        return numberValue(left, 'Divisão') / divisor;
      }
      case '%': {
        const divisor = numberValue(right, 'Módulo');
        if (divisor === 0) throw new BitRuntimeError('Módulo por zero não é permitido.');
        return numberValue(left, 'Módulo') % divisor;
      }
      case '==':
        return left === right;
      case '!=':
        return left !== right;
      case '<':
        return numberValue(left, 'Comparação') < numberValue(right, 'Comparação');
      case '<=':
        return numberValue(left, 'Comparação') <= numberValue(right, 'Comparação');
      case '>':
        return numberValue(left, 'Comparação') > numberValue(right, 'Comparação');
      case '>=':
        return numberValue(left, 'Comparação') >= numberValue(right, 'Comparação');
      default:
        throw new BitRuntimeError(`Operador "${op}" não suportado.`);
    }
  }

  executeStmt(stmt: Stmt, env: Environment = this.currentEnv): void {
    this.tick();

    switch (stmt.kind) {
      case 'assign': {
        const value = this.evalExpr(stmt.value, env);

        if (stmt.property) {
          const obj = env.get(stmt.target);
          if (!(obj instanceof Actor)) {
            throw new BitRuntimeError(`"${stmt.target}" não é um ator válido.`);
          }

          const prop = stmt.property.toLowerCase();
          if (prop === 'x') obj.x = numberValue(value, 'A propriedade x');
          else if (prop === 'y') obj.y = numberValue(value, 'A propriedade y');
          else if (prop === 'vx') obj.vx = numberValue(value, 'A propriedade vx');
          else if (prop === 'vy') obj.vy = numberValue(value, 'A propriedade vy');
          else if (prop === 'largura') {
            obj.width = numberValue(value, 'A propriedade largura');
            if (obj.shape) obj.shape.width = obj.width;
          } else if (prop === 'altura') {
            obj.height = numberValue(value, 'A propriedade altura');
            if (obj.shape) obj.shape.height = obj.height;
          } else if (prop === 'ativo' || prop === 'visivel' || prop === 'visível') {
            obj.active = Boolean(value);
          } else if (prop === 'cor') {
            if (!obj.shape) throw new BitRuntimeError(`O ator "${obj.name}" não possui desenho.`);
            obj.shape.color = String(value);
          } else if (prop === 'texto' || prop === 'text') {
            if (!obj.shape || obj.shape.type !== 'texto') {
              throw new BitRuntimeError(`O ator "${obj.name}" não possui texto editável.`);
            }
            obj.shape.text = String(value);
          } else if (prop === 'angulo' || prop === 'ângulo') {
            obj.angle = numberValue(value, 'A propriedade ângulo');
          } else if (prop === 'alfa' || prop === 'opacidade') {
            obj.opacity = Math.max(0, Math.min(1, numberValue(value, 'A propriedade alfa')));
          } else if (prop in obj.props) {
            obj.props[prop] = value;
          } else {
            obj.props[prop] = value;
          }
          break;
        }

        const lowerTarget = stmt.target.toLowerCase();
        if (this.currentActor && ['x', 'y', 'vx', 'vy', 'largura', 'altura', 'cor', 'texto', 'text', 'angulo', 'ângulo', 'visivel', 'visível', 'alfa', 'opacidade'].includes(lowerTarget)) {
          this.assignCurrentActorProperty(lowerTarget, value);
        } else if (env.has(lowerTarget)) {
          env.assign(lowerTarget, value);
        } else {
          env.set(lowerTarget, value);
        }
        break;
      }

      case 'if':
        if (Boolean(this.evalExpr(stmt.cond, env))) {
          this.executeBlock(stmt.then, new Environment(env));
        } else if (stmt.els?.length) {
          this.executeBlock(stmt.els, new Environment(env));
        }
        break;

      case 'repeat': {
        const times = numberValue(this.evalExpr(stmt.times, env), 'repita');
        const actual = Math.max(0, Math.min(Math.floor(times), this.maxInstructions));
        for (let i = 0; i < actual; i++) {
          this.executeBlock(stmt.body, new Environment(env));
        }
        break;
      }

      case 'for': {
        const start = numberValue(this.evalExpr(stmt.start, env), 'início do para');
        const end = numberValue(this.evalExpr(stmt.end, env), 'fim do para');
        const step = stmt.step ? numberValue(this.evalExpr(stmt.step, env), 'passo do para') : (start <= end ? 1 : -1);
        if (step === 0) throw new BitRuntimeError('O passo do para não pode ser zero.');

        const scope = new Environment(env);
        let value = start;
        let iterations = 0;
        while (step > 0 ? value <= end : value >= end) {
          if (++iterations > this.maxInstructions) throw new BitRuntimeError('Limite de execução excedido no para.');
          scope.set(stmt.variable, value);
          this.executeBlock(stmt.body, scope);
          value += step;
        }
        break;
      }

      case 'while': {
        let iterations = 0;
        while (Boolean(this.evalExpr(stmt.cond, env))) {
          if (++iterations > this.maxInstructions) throw new BitRuntimeError('Limite de execução excedido no enquanto.');
          this.executeBlock(stmt.body, new Environment(env));
        }
        break;
      }

      case 'func':
        env.set(stmt.name, { params: stmt.params, body: stmt.body, closure: env } satisfies UserFunction);
        break;

      case 'return':
        throw new ReturnSignal(stmt.value ? this.evalExpr(stmt.value, env) : undefined);

      case 'say': {
        const msg = String(this.evalExpr(stmt.expr, env) ?? '');
        this.outputLog.push(msg);
        this.onSay?.(msg);
        break;
      }

      case 'turn': {
        if (!this.currentActor) throw new BitRuntimeError('"vira" só pode ser usado dentro de um ator.');
        this.currentActor.angle = (this.currentActor.angle + numberValue(this.evalExpr(stmt.angle, env), 'Ângulo')) % 360;
        break;
      }

      case 'call_stmt':
        this.evalExpr(stmt.expr, env);
        break;
    }
  }

  private assignCurrentActorProperty(prop: string, value: unknown): void {
    if (!this.currentActor) return;
    const actor = this.currentActor;
    if (['x', 'y', 'vx', 'vy', 'largura', 'altura', 'angulo', 'ângulo', 'alfa', 'opacidade'].includes(prop)) {
      const n = numberValue(value, `A propriedade ${prop}`);
      if (prop === 'x') actor.x = n;
      else if (prop === 'y') actor.y = n;
      else if (prop === 'vx') actor.vx = n;
      else if (prop === 'vy') actor.vy = n;
      else if (prop === 'largura') { actor.width = n; if (actor.shape) actor.shape.width = n; }
      else if (prop === 'altura') { actor.height = n; if (actor.shape) actor.shape.height = n; }
      else if (prop === 'angulo' || prop === 'ângulo') actor.angle = n;
      else actor.opacity = Math.max(0, Math.min(1, n));
    } else if (prop === 'cor') {
      if (!actor.shape) throw new BitRuntimeError(`O ator "${actor.name}" não possui desenho.`);
      actor.shape.color = String(value);
    } else if (prop === 'texto' || prop === 'text') {
      if (!actor.shape || actor.shape.type !== 'texto') throw new BitRuntimeError(`O ator "${actor.name}" não possui texto editável.`);
      actor.shape.text = String(value);
    } else {
      actor.active = Boolean(value);
    }
  }

  executeBlock(statements: Stmt[], env: Environment): void {
    const prevEnv = this.currentEnv;
    this.currentEnv = env;
    try {
      for (const statement of statements) this.executeStmt(statement, env);
    } finally {
      this.currentEnv = prevEnv;
    }
  }
}
