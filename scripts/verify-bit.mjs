import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const REQUIRED = [
  'package.json','tsconfig.json','vite.config.ts','index.html',
  'src/types.ts','src/colors.ts','src/lexer.ts','src/parser.ts',
  'src/interp/builtins.ts','src/interp/interpreter.ts',
  'src/runtime/actor.ts','src/runtime/game.ts','src/runtime/collision.ts',
  'src/index.ts','src/library-data.ts','src/grammar.ts',
  'docs/README.md','docs/BIT-LANGUAGE-REFERENCE.md','stdlib/README.md',
  'examples/hello.bit','examples/movement.bit','examples/pong.bit',
  'examples/nave.bit','examples/breakout.bit','examples/tetris.bit',
  'tests/lexer.test.ts','tests/parser.test.ts','tests/grammar-v1.2.test.ts',
  'tests/builtins.test.ts','tests/interpreter.test.ts','tests/runtime.test.ts',
  'tests/examples.test.ts','tests/library.test.ts'
];

let ok = true;
const fail = (m) => { console.error(`  ❌ ${m}`); ok = false; };
const pass = (m) => console.log(`  ✓ ${m}`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 VERIFICAÇÃO BIT 1.2');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
if (pkg.version === '1.2.0') pass('package.json está na versão 1.2.0.');
else fail(`package.json está na versão ${pkg.version}; esperado 1.2.0.`);

for (const file of REQUIRED) {
  if (fs.existsSync(path.join(ROOT, file))) pass(file);
  else fail(`Arquivo ausente: ${file}`);
}

const vite = fs.readFileSync(path.join(ROOT, 'vite.config.ts'), 'utf8');
if (vite.includes("base: '/Bit-1.0/'")) pass('Vite usa base /Bit-1.0/.');
else fail('vite.config.ts não usa base /Bit-1.0/.');

try {
  execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['test', '--', '--run'], { cwd: ROOT, stdio: 'inherit' });
  pass('Suíte Vitest passou.');
} catch {
  fail('A suíte Vitest falhou.');
}

try {
  execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], { cwd: ROOT, stdio: 'inherit' });
  pass('Build de produção passou.');
} catch {
  fail('Build de produção falhou.');
}

const dist = path.join(ROOT, 'dist');
let bytes = 0;
function sizeOf(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) sizeOf(p);
    else bytes += fs.statSync(p).size;
  }
}
if (fs.existsSync(dist)) pass(`dist total: ${(sizeOf(dist), bytes / 1024).toFixed(2)} KB.`);
else fail('dist não foi gerado.');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(ok ? 'VERIFICAÇÃO: PASS' : 'VERIFICAÇÃO: FAIL');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
process.exit(ok ? 0 : 1);
