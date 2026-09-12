import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 INICIANDO VERIFICAÇÃO BIT 1.0');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let allPass = true;

// 1. Verificação de Estrutura de Arquivos
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'index.html',
  'src/types.ts',
  'src/colors.ts',
  'src/lexer.ts',
  'src/parser.ts',
  'src/interp/builtins.ts',
  'src/interp/interpreter.ts',
  'src/runtime/actor.ts',
  'src/runtime/game.ts',
  'src/runtime/collision.ts',
  'src/index.ts',
  'src/library-data.ts',
  'examples/pong.bit',
  'examples/nave.bit',
  'examples/breakout.bit',
  'examples/tetris.bit',
  'tests/parser.test.ts',
  'tests/lexer.test.ts',
  'tests/builtins.test.ts',
  'tests/interpreter.test.ts',
  'tests/runtime.test.ts',
  'tests/examples.test.ts',
  'tests/library.test.ts'
];

console.log('1. Verificação de Estrutura:');
let missingFiles = 0;
for (const file of requiredFiles) {
  const fullPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(fullPath)) {
    console.error(`  ❌ Arquivo ausente: ${file}`);
    missingFiles++;
    allPass = false;
  }
}
if (missingFiles === 0) {
  console.log(`  ✓ Todos os ${requiredFiles.length} arquivos essenciais estão presentes.`);
} else {
  console.error(`  ❌ ${missingFiles} arquivos ausentes!`);
}

// 2. Verificação de Base do GitHub Pages (/objetos/)
const viteConfigContent = fs.readFileSync(path.resolve(process.cwd(), 'vite.config.ts'), 'utf-8');
if (viteConfigContent.includes("base: '/objetos/'")) {
  console.log('  ✓ Configuração base "/objetos/" preservada no vite.config.ts.');
} else {
  console.error('  ❌ Base "/objetos/" não encontrada no vite.config.ts!');
  allPass = false;
}

// 3. Execução de Testes
console.log('\n2. Execução dos Testes Automatizados (npm test):');
try {
  const testOutput = execSync('npm test', { encoding: 'utf-8', stdio: 'pipe' });
  console.log('  ✓ Todos os testes unitários e de integração passaram.');
} catch (err) {
  console.error('  ❌ Falha na execução dos testes!');
  console.error(err.stdout || err.message);
  allPass = false;
}

// 4. Execução do Build
console.log('\n3. Execução do Build de Produção (npm run build):');
try {
  const buildOutput = execSync('npm run build', { encoding: 'utf-8', stdio: 'pipe' });
  console.log('  ✓ Build de produção gerado com sucesso.');
} catch (err) {
  console.error('  ❌ Falha no build!');
  console.error(err.stdout || err.message);
  allPass = false;
}

// 5. Verificação do Bundle Size
console.log('\n4. Verificação do Tamanho do Bundle:');
const distDir = path.resolve(process.cwd(), 'dist');
let totalBytes = 0;
if (fs.existsSync(distDir)) {
  const getDirSize = (dir) => {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fp = path.join(dir, f);
      const stat = fs.statSync(fp);
      if (stat.isDirectory()) {
        getDirSize(fp);
      } else {
        totalBytes += stat.size;
      }
    }
  };
  getDirSize(distDir);
  const totalKB = (totalBytes / 1024).toFixed(2);
  console.log(`  ✓ Tamanho total do dist: ${totalKB} KB (meta: < 300 KB).`);
  if (totalBytes > 300 * 1024) {
    console.warn(`  ⚠️ Alerta: Bundle ultrapassou 300 KB (${totalKB} KB)`);
  }
} else {
  console.error('  ❌ Diretório dist não encontrado.');
  allPass = false;
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (allPass) {
  console.log('TESTES: PASS');
  console.log('BUILD: PASS');
  console.log('VERIFICAÇÃO: PASS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(0);
} else {
  console.error('TESTES: FAIL ou VERIFICAÇÃO: FAIL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(1);
}
