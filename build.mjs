import {build} from 'esbuild';
import {mkdir,copyFile,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist');
for(const f of ['index.html','style.css','app.js','sw.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png'])await copyFile(f,'dist/'+f);
await build({entryPoints:['bridge.js'],bundle:true,format:'esm',outfile:'dist/runtime.js',minify:true});
await build({entryPoints:['worker.js'],bundle:true,format:'esm',outfile:'dist/ai-worker.js',minify:true});
await copyFile('.nojekyll','dist/.nojekyll');
