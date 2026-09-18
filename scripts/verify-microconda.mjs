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
  'docs/README.md','docs/MICROCONDA-LANGUAGE-REFERENCE.md','stdlib/README.md',
  'examples/hello.micro','examples/movement.micro','examples/pong.micro',
  'examples/nave.micro','examples/breakout.micro','examples/tetris.micro',
  'tests/lexer.test.ts','tests/parser.test.ts','tests/builtins.test.ts',
  'tests/interpreter.test.ts','tests/runtime.test.ts','tests/examples.test.ts',
  'tests/library.test.ts'
];

let ok=true;
const fail=m=>{console.error('  FAIL '+m);ok=false};
const pass=m=>console.log('  PASS '+m);
console.log('=== MicroConda verification ===');

const pkg=JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8'));
if(pkg.name==='microconda-studio' && pkg.version==='1.0.0') pass('package identity is MicroConda 1.0.0');
else fail('package identity/version is not MicroConda 1.0.0');

for(const file of REQUIRED) fs.existsSync(path.join(ROOT,file))?pass(file):fail('missing '+file);

const index=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
if(!/MicroConda Studio/.test(index)) fail('index.html does not expose MicroConda branding');
else pass('MicroConda branding present in index.html');

const vite=fs.readFileSync(path.join(ROOT,'vite.config.ts'),'utf8');
if(/base:\s*process\.env\.BASE_PATH\s*\|\|\s*['"]\.\/['"]/.test(vite)) pass('Vite relative base configured');
else fail('Vite relative base missing');

try{execFileSync(process.platform==='win32'?'npm.cmd':'npm',['test','--','--run'],{cwd:ROOT,stdio:'inherit'});pass('Vitest suite passed');}catch{fail('Vitest suite failed')}
try{execFileSync(process.platform==='win32'?'npm.cmd':'npm',['run','build'],{cwd:ROOT,stdio:'inherit'});pass('production build passed');}catch{fail('production build failed')}

console.log(ok?'VERIFICATION: PASS':'VERIFICATION: FAIL');
process.exit(ok?0:1);
