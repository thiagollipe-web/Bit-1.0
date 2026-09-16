import { playBitSound, playBeep } from '../runtime/audio.ts';

export type Builtin = (args: unknown[]) => unknown;

export interface BuiltinContext {
  isKeyDown: (key: string) => boolean;
  isTouchActive: () => boolean;
  getActor: (name: string) => { x: number; y: number; width: number; height: number } | undefined;
  checkCollision: (a: unknown, b: unknown) => boolean;
  getTime: () => number;
  getMousePos?: () => { x: number; y: number; pressed: boolean };
  playSound?: (name: string) => void;
  playBeepSound?: (freq: number, dur: number) => void;
}

export function createBuiltins(context?: Partial<BuiltinContext>): Map<string, Builtin> {
  const isKeyDown = context?.isKeyDown ?? (() => false);
  const isTouchActive = context?.isTouchActive ?? (() => false);
  const checkCollision = context?.checkCollision ?? (() => false);
  const getTime = context?.getTime ?? (() => performance.now() / 1000);
  const getMousePos = context?.getMousePos ?? (() => ({ x: 0, y: 0, pressed: false }));
  const soundPlayer = context?.playSound ?? ((name: string) => playBitSound(name));
  const beepPlayer = context?.playBeepSound ?? ((freq: number, dur: number) => playBeep(freq, dur));

  const aleatorioFn: Builtin = (args: unknown[]): number => {
    const min = typeof args[0] === 'number' ? args[0] : 0;
    const max = typeof args[1] === 'number' ? args[1] : 100;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const distanciaFn: Builtin = (args: unknown[]): number => {
    const x1 = Number(args[0]) || 0;
    const y1 = Number(args[1]) || 0;
    const x2 = Number(args[2]) || 0;
    const y2 = Number(args[3]) || 0;
    return Math.hypot(x2 - x1, y2 - y1);
  };

  const colideFn: Builtin = (args: unknown[]): boolean => {
    return checkCollision(args[0], args[1]);
  };

  const teclaFn: Builtin = (args: unknown[]): boolean => {
    const key = String(args[0] ?? '').toLowerCase();
    return isKeyDown(key);
  };

  const toqueFn: Builtin = (): boolean => {
    return isTouchActive();
  };

  const senoFn: Builtin = (args: unknown[]): number => {
    const ang = Number(args[0]) || 0;
    return Math.sin((ang * Math.PI) / 180);
  };

  const cossenoFn: Builtin = (args: unknown[]): number => {
    const ang = Number(args[0]) || 0;
    return Math.cos((ang * Math.PI) / 180);
  };

  const raizFn: Builtin = (args: unknown[]): number => {
    const val = Number(args[0]) || 0;
    return Math.sqrt(Math.max(0, val));
  };

  const absolutoFn: Builtin = (args: unknown[]): number => {
    return Math.abs(Number(args[0]) || 0);
  };

  const pisoFn: Builtin = (args: unknown[]): number => {
    return Math.floor(Number(args[0]) || 0);
  };

  const tetoFn: Builtin = (args: unknown[]): number => {
    return Math.ceil(Number(args[0]) || 0);
  };

  const arredondaFn: Builtin = (args: unknown[]): number => {
    return Math.round(Number(args[0]) || 0);
  };

  const tempoFn: Builtin = (): number => {
    return getTime();
  };

  // Funções matemáticas e utilitárias adicionais (BIT 1.3)
  const limitarFn: Builtin = (args: unknown[]): number => {
    const val = Number(args[0]) || 0;
    const min = Number(args[1]) || 0;
    const max = Number(args[2]) || 0;
    return Math.min(Math.max(val, min), max);
  };

  const interpolarFn: Builtin = (args: unknown[]): number => {
    const a = Number(args[0]) || 0;
    const b = Number(args[1]) || 0;
    const t = Number(args[2]) || 0;
    return a + (b - a) * Math.min(Math.max(t, 0), 1);
  };

  const potenciaFn: Builtin = (args: unknown[]): number => {
    const base = Number(args[0]) || 0;
    const exp = Number(args[1]) || 0;
    return Math.pow(base, exp);
  };

  const anguloFn: Builtin = (args: unknown[]): number => {
    const x1 = Number(args[0]) || 0;
    const y1 = Number(args[1]) || 0;
    const x2 = Number(args[2]) || 0;
    const y2 = Number(args[3]) || 0;
    return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  };

  // Funções de Mouse e Entrada
  const mouseXFn: Builtin = (): number => {
    return getMousePos().x;
  };

  const mouseYFn: Builtin = (): number => {
    return getMousePos().y;
  };

  const mousePressionadoFn: Builtin = (): boolean => {
    return getMousePos().pressed || isTouchActive();
  };

  // Funções de Conversão
  const paraTextoFn: Builtin = (args: unknown[]): string => {
    return String(args[0] ?? '');
  };

  const paraNumeroFn: Builtin = (args: unknown[]): number => {
    return Number(args[0]) || 0;
  };

  // Persistência local no navegador (gravação de recordes/estados)
  const gravarFn: Builtin = (args: unknown[]): boolean => {
    try {
      const key = 'bit_storage_' + String(args[0] ?? 'padrao');
      const val = JSON.stringify(args[1]);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, val);
        return true;
      }
    } catch {
      // Ignorar falha
    }
    return false;
  };

  const carregarFn: Builtin = (args: unknown[]): unknown => {
    try {
      const key = 'bit_storage_' + String(args[0] ?? 'padrao');
      const defVal = args[1];
      if (typeof localStorage !== 'undefined') {
        const item = localStorage.getItem(key);
        if (item !== null) {
          return JSON.parse(item);
        }
      }
      return defVal;
    } catch {
      return args[1];
    }
  };

  // Efeitos Sonoros Retrô (Áudio 8-bit)
  const tocarSomFn: Builtin = (args: unknown[]): void => {
    const soundName = String(args[0] ?? 'bip');
    soundPlayer(soundName);
  };

  const bipFn: Builtin = (args: unknown[]): void => {
    const freq = Number(args[0]) || 440;
    const dur = Number(args[1]) || 0.1;
    beepPlayer(freq, dur);
  };

  const builtins: Array<[string, Builtin]> = [
    ['aleatorio', aleatorioFn],
    ['aleatório', aleatorioFn],
    ['colide', colideFn],
    ['distancia', distanciaFn],
    ['distância', distanciaFn],
    ['tecla', teclaFn],
    ['toque', toqueFn],
    ['seno', senoFn],
    ['cosseno', cossenoFn],
    ['raiz', raizFn],
    ['absoluto', absolutoFn],
    ['piso', pisoFn],
    ['teto', tetoFn],
    ['arredonda', arredondaFn],
    ['tempo', tempoFn],
    // Novas em BIT 1.3
    ['limitar', limitarFn],
    ['clamp', limitarFn],
    ['interpolar', interpolarFn],
    ['lerp', interpolarFn],
    ['potencia', potenciaFn],
    ['potência', potenciaFn],
    ['angulo', anguloFn],
    ['ângulo', anguloFn],
    ['mouse_x', mouseXFn],
    ['mouse_y', mouseYFn],
    ['mouse_pressionado', mousePressionadoFn],
    ['clique', mousePressionadoFn],
    ['para_texto', paraTextoFn],
    ['texto', paraTextoFn],
    ['para_numero', paraNumeroFn],
    ['para_número', paraNumeroFn],
    ['numero', paraNumeroFn],
    ['número', paraNumeroFn],
    ['gravar', gravarFn],
    ['salvar', gravarFn],
    ['carregar', carregarFn],
    ['tocar_som', tocarSomFn],
    ['som', tocarSomFn],
    ['bip', bipFn]
  ];

  return new Map<string, Builtin>(builtins);
}
