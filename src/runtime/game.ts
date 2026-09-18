import { ProgramAST } from '../types.ts';
import { Actor, InputState } from './actor.ts';
import { checkAABB } from './collision.ts';
import { createBuiltins, BuiltinContext } from '../interp/builtins.ts';
import { Interpreter } from '../interp/interpreter.ts';
import { resolveColor } from '../colors.ts';

export class Game {
  ast: ProgramAST;
  actors: Map<string, Actor> = new Map();
  interpreter: Interpreter;
  input: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    action: false,
    touchActive: false
  };
  keysDown = new Set<string>();
  running = false;
  animationFrameId: number | null = null;
  canvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  logs: string[] = [];
  private attachedListeners: Array<{
    element: HTMLElement | Window;
    type: string;
    listener: any;
    options?: any;
  }> = [];

  constructor(ast: ProgramAST, canvas?: HTMLCanvasElement) {
    this.ast = ast;
    this.canvas = canvas ?? null;
    this.ctx = canvas ? canvas.getContext('2d') : null;

    // Instantiate actors from AST
    for (const actorDecl of ast.actors) {
      const actor = new Actor(
        actorDecl.name,
        actorDecl.x,
        actorDecl.y,
        actorDecl.vx,
        actorDecl.vy,
        actorDecl.shape,
        actorDecl.controlledBy,
        actorDecl.limitToScreen,
        actorDecl.bounceBorders
      );
      this.actors.set(actorDecl.name.toLowerCase(), actor);
    }

    // Set up Builtin Context with real mouse and touch tracking
    const builtinCtx: BuiltinContext = {
      isKeyDown: (key) => {
        const normalized = key.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
        const aliases: Record<string, string[]> = {
          esquerda: ['arrowleft', 'a'],
          direita: ['arrowright', 'd'],
          cima: ['arrowup', 'w'],
          baixo: ['arrowdown', 's'],
          espaco: [' ', 'space'],
          barra_de_espaco: [' ', 'space'],
          enter: ['enter']
        };
        const candidates = aliases[normalized] ?? [normalized];
        return candidates.some(candidate => this.keysDown.has(candidate));
      },
      isTouchActive: () => this.input.touchActive,
      getMousePos: () => ({
        x: this.input.touchX ?? 0,
        y: this.input.touchY ?? 0,
        pressed: this.input.touchActive
      }),
      getActor: (name) => {
        const a = this.actors.get(name.toLowerCase());
        return a ? { x: a.x, y: a.y, width: a.width, height: a.height } : undefined;
      },
      checkCollision: (a, b) => {
        const actA = a instanceof Actor ? a : this.actors.get(String(a).toLowerCase());
        const actB = b instanceof Actor ? b : this.actors.get(String(b).toLowerCase());
        if (actA && actB) {
          return checkAABB(actA, actB);
        }
        return false;
      },
      getTime: () => performance.now() / 1000
    };

    const builtins = createBuiltins(builtinCtx);
    this.interpreter = new Interpreter(builtins, this.actors);
    this.interpreter.onSay = (msg) => {
      this.logs.push(msg);
    };

    // Set up native event listeners for Canvas touch/mouse coordinates
    if (this.canvas) {
      const getLogicalCoords = (e: MouseEvent | TouchEvent) => {
        if (!this.canvas) return { x: 0, y: 0 };
        const rect = this.canvas.getBoundingClientRect();
        let clientX = 0;
        let clientY = 0;
        
        if ('touches' in e) {
          if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
          } else if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
          }
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }
        
        const physicalX = clientX - rect.left;
        const physicalY = clientY - rect.top;
        const logicalX = rect.width > 0 ? (physicalX / rect.width) * this.ast.screenWidth : 0;
        const logicalY = rect.height > 0 ? (physicalY / rect.height) * this.ast.screenHeight : 0;
        return { x: logicalX, y: logicalY };
      };

      const handleStart = (e: MouseEvent | TouchEvent) => {
        const coords = getLogicalCoords(e);
        this.input.touchX = coords.x;
        this.input.touchY = coords.y;
        this.input.touchActive = true;
      };

      const handleMove = (e: MouseEvent | TouchEvent) => {
        const coords = getLogicalCoords(e);
        this.input.touchX = coords.x;
        this.input.touchY = coords.y;
      };

      const handleEnd = () => {
        this.input.touchActive = false;
      };

      // Register tracked event listeners on the canvas
      this.addTrackedListener(this.canvas, 'mousedown', handleStart);
      this.addTrackedListener(this.canvas, 'mousemove', handleMove);
      this.addTrackedListener(this.canvas, 'mouseup', handleEnd);

      this.addTrackedListener(this.canvas, 'touchstart', (e: TouchEvent) => {
        // Prevent scrolling/gestures on game screen
        e.preventDefault();
        handleStart(e);
      }, { passive: false });
      
      this.addTrackedListener(this.canvas, 'touchmove', (e: TouchEvent) => {
        e.preventDefault();
        handleMove(e);
      }, { passive: false });
      
      this.addTrackedListener(this.canvas, 'touchend', (e: TouchEvent) => {
        e.preventDefault();
        handleEnd();
      }, { passive: false });
    }

    // Register tracked keyboard input on window
    const handleWinKeyDown = (e: KeyboardEvent) => {
      if (typeof document === 'undefined') return;
      const active = document.activeElement;
      if (
        active && (
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'INPUT' ||
          active.id === 'code-editor' ||
          active.id === 'new-program-name' ||
          active.id === 'ai-prompt-input' ||
          active.id === 'lib-search-input'
        )
      ) {
        return;
      }
      this.handleKeyDown(e.key);
    };

    const handleWinKeyUp = (e: KeyboardEvent) => {
      if (typeof document === 'undefined') return;
      const active = document.activeElement;
      if (
        active && (
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'INPUT' ||
          active.id === 'code-editor' ||
          active.id === 'new-program-name' ||
          active.id === 'ai-prompt-input' ||
          active.id === 'lib-search-input'
        )
      ) {
        return;
      }
      this.handleKeyUp(e.key);
    };

    if (typeof window !== 'undefined') {
      this.addTrackedListener(window, 'keydown', handleWinKeyDown);
      this.addTrackedListener(window, 'keyup', handleWinKeyUp);
    }

    // Execute global statements
    this.interpreter.resetBudget();
    this.interpreter.executeBlock(ast.globalStatements, this.interpreter.globalEnv);

    // Execute initial statements inside each actor declaration
    for (const actorDecl of ast.actors) {
      const actor = this.actors.get(actorDecl.name.toLowerCase());
      if (actor && actorDecl.statements.length > 0) {
        this.interpreter.currentActor = actor;
        this.interpreter.executeBlock(actorDecl.statements, this.interpreter.globalEnv);
        this.interpreter.currentActor = undefined;
      }
    }
  }

  private addTrackedListener(
    element: HTMLElement | Window,
    type: string,
    listener: any,
    options?: any
  ): void {
    element.addEventListener(type, listener, options);
    this.attachedListeners.push({ element, type, listener, options });
  }

  private cleanupListeners(): void {
    for (const item of this.attachedListeners) {
      item.element.removeEventListener(item.type, item.listener, item.options);
    }
    this.attachedListeners = [];
  }

  handleKeyDown(key: string): void {
    const k = key.toLowerCase();
    this.keysDown.add(k);
    if (k === 'arrowup' || k === 'w') this.input.up = true;
    if (k === 'arrowdown' || k === 's') this.input.down = true;
    if (k === 'arrowleft' || k === 'a') this.input.left = true;
    if (k === 'arrowright' || k === 'd') this.input.right = true;
    if (k === ' ' || k === 'enter') this.input.action = true;
  }

  handleKeyUp(key: string): void {
    const k = key.toLowerCase();
    this.keysDown.delete(k);
    if (k === 'arrowup' || k === 'w') this.input.up = false;
    if (k === 'arrowdown' || k === 's') this.input.down = false;
    if (k === 'arrowleft' || k === 'a') this.input.left = false;
    if (k === 'arrowright' || k === 'd') this.input.right = false;
    if (k === ' ' || k === 'enter') this.input.action = false;
  }

  handleTouch(x?: number, y?: number, active: boolean = true): void {
    this.input.touchX = x;
    this.input.touchY = y;
    this.input.touchActive = active;
  }

  step(): void {
    if (!this.running && this.animationFrameId === null) {
      // step() is also used directly by tests and tooling.
    }
    this.interpreter.resetBudget();
    const { screenWidth, screenHeight } = this.ast;

    // 1. Update physics and positions of actors
    for (const actor of this.actors.values()) {
      actor.update(screenWidth, screenHeight, this.input);
    }

    // 2. Check collisions between pairs of actors
    const actorList = Array.from(this.actors.values());
    for (let i = 0; i < actorList.length; i++) {
      for (let j = i + 1; j < actorList.length; j++) {
        const a1 = actorList[i];
        const a2 = actorList[j];
        if (a1.active && a2.active && checkAABB(a1, a2)) {
          // Trigger collision event on a1
          this.triggerActorEvent(a1, `colide:${a2.name}`);
          this.triggerActorEvent(a1, 'colide');
          // Trigger collision event on a2
          this.triggerActorEvent(a2, `colide:${a1.name}`);
          this.triggerActorEvent(a2, 'colide');
        }
      }
    }

    // 3. Trigger frame update events (quando atualiza:)
    for (const actor of this.actors.values()) {
      if (actor.active) {
        this.triggerActorEvent(actor, 'atualiza');
      }
    }

    // 4. Render to canvas if present
    this.render();
  }

  private triggerActorEvent(actor: Actor, eventKey: string): void {
    const decl = this.ast.actors.find(a => a.name.toLowerCase() === actor.name.toLowerCase());
    if (!decl) return;

    const normalizedKey = eventKey.toLowerCase();
    const exactKey = Object.keys(decl.events).find(key => key.toLowerCase() === normalizedKey);
    const handler = exactKey ? decl.events[exactKey] : undefined;
    if (handler && handler.length > 0) {
      this.interpreter.currentActor = actor;
      try {
        this.interpreter.executeBlock(handler, this.interpreter.globalEnv);
      } finally {
        this.interpreter.currentActor = undefined;
      }
    }
  }

  render(): void {
    if (!this.ctx || !this.canvas) return;

    const cols = Math.max(1, Math.round(this.ast.screenWidth));
    const rows = Math.max(1, Math.round(this.ast.screenHeight));
    const backgroundColor = this.ast.backgroundColor;

    // Create a terminal character buffer
    // Each cell contains a character and a color
    const buffer: { char: string; color: string }[][] = [];
    for (let r = 0; r < rows; r++) {
      const rowArr: { char: string; color: string }[] = [];
      for (let c = 0; c < cols; c++) {
        rowArr.push({ char: ' ', color: 'branco' });
      }
      buffer.push(rowArr);
    }

    // Sort actors if needed, or draw them in order
    for (const actor of this.actors.values()) {
      if (!actor.active) continue;

      const actorColor = actor.shape?.color ?? 'branco';
      const shapeType = actor.shape?.type ?? 'quadrado';

      if (shapeType === 'texto' && actor.shape?.text) {
        const text = actor.shape.text;
        const lines = text.split('\n');
        for (let rIdx = 0; rIdx < lines.length; rIdx++) {
          const line = lines[rIdx];
          for (let cIdx = 0; cIdx < line.length; cIdx++) {
            const ch = line[cIdx];
            const gridX = Math.round(actor.x) + cIdx;
            const gridY = Math.round(actor.y) + rIdx;
            if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
              buffer[gridY][gridX] = { char: ch, color: actorColor };
            }
          }
        }
      } else {
        // Handle geometric shapes as solid blocks
        const w = Math.max(1, Math.round(actor.width));
        const h = Math.max(1, Math.round(actor.height));
        const fillChar = shapeType === 'circulo' ? '●' : shapeType === 'triangulo' ? '▲' : '█';

        for (let rIdx = 0; rIdx < h; rIdx++) {
          for (let cIdx = 0; cIdx < w; cIdx++) {
            const gridX = Math.round(actor.x) + cIdx;
            const gridY = Math.round(actor.y) + rIdx;
            if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
              buffer[gridY][gridX] = { char: fillChar, color: actorColor };
            }
          }
        }
      }
    }

    // Now render the buffer onto the canvas
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const cellW = canvasWidth / cols;
    const cellH = canvasHeight / rows;

    this.ctx.fillStyle = resolveColor(backgroundColor, '#000000');
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const fontSize = Math.floor(cellH * 0.95);
    this.ctx.font = `bold ${fontSize}px Fira Code, Courier New, monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = buffer[r][c];
        if (cell && cell.char !== ' ') {
          this.ctx.fillStyle = resolveColor(cell.color, '#ffffff');
          const charX = c * cellW + cellW / 2;
          const charY = r * cellH + cellH / 2;
          this.ctx.fillText(cell.char, charX, charY);
        }
      }
    }

    // CRT scanline overlays for that beautiful retro terminal feeling
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < canvasHeight; y += 4) {
      this.ctx.fillRect(0, y, canvasWidth, 1.5);
    }
  }

  start(): void {
    if (this.running) return;
    if (typeof window === 'undefined' || typeof requestAnimationFrame !== 'function') {
      throw new Error('O runtime do navegador é necessário para iniciar o loop do jogo.');
    }

    this.running = true;
    const loop = () => {
      if (!this.running) return;
      try {
        this.step();
        this.animationFrameId = requestAnimationFrame(loop);
      } catch (error) {
        this.running = false;
        this.animationFrameId = null;
        throw error;
      }
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.keysDown.clear();
    this.input.up = false;
    this.input.down = false;
    this.input.left = false;
    this.input.right = false;
    this.input.action = false;
    this.input.touchActive = false;
    this.cleanupListeners();
  }
}
