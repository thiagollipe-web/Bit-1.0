import { criarJogoMicroConda } from './index.ts';
import { MICROCONDA_LIBRARY } from './library-data.ts';

const editor=document.getElementById('code-editor') as HTMLTextAreaElement;
const canvas=document.getElementById('game-canvas') as HTMLCanvasElement;
const consoleEl=document.getElementById('console') as HTMLDivElement;
const titleEl=document.getElementById('title') as HTMLElement;
const saveState=document.getElementById('saveState') as HTMLElement;
const cursorEl=document.getElementById('cursor') as HTMLElement;
const modal=document.getElementById('modal') as HTMLDivElement;
const modalTitle=document.getElementById('modalTitle') as HTMLElement;
const modalBody=document.getElementById('modalBody') as HTMLElement;
const fileInput=document.getElementById('file') as HTMLInputElement;
let game:ReturnType<typeof criarJogoMicroConda>['game']|null=null;
let autosaveTimer: ReturnType<typeof setTimeout>|undefined;
let currentTitle='Meu Projeto';

const EXAMPLES:Record<string,string>={
  vazio:'tela 40x25\nfundo preto\n\nator Jogador\n  desenho quadrado 1, verde\n  posição 19, 12\n  controlado por setas\n  limita à tela\nfim',
  movimento:'tela 40x25\nfundo preto\n\nator Jogador\n  desenho quadrado 2, verde\n  posição 19, 12\n  controlado por setas\n  limita à tela\n  quica nas bordas\nfim\n\ndiga "Use as setas para mover o jogador."',
  colisao:'tela 40x25\nfundo preto\n\nator Jogador\n  desenho quadrado 2, verde\n  posição 10, 12\n  controlado por setas\n  limita à tela\nfim\n\nator Alvo\n  desenho circulo 2, amarelo\n  posição 28, 12\nfim\n\ndiga "Colete o alvo."',
  demo:'tela 40x25\nfundo preto\n\nator Jogador\n  desenho quadrado 2, ciano\n  posição 18, 12\n  controlado por setas\n  limita à tela\nfim\n\ndiga "MicroConda ativo"'
};

const STORAGE_CODE='microconda:code', STORAGE_TITLE='microconda:title';
function log(message:string,error=false){const line=document.createElement('div');line.textContent=(error?'ERRO: ':'')+message;if(error)line.style.color='var(--danger)';consoleEl.appendChild(line);consoleEl.scrollTop=consoleEl.scrollHeight;}
function setModal(title:string,body:HTMLElement|string){modalTitle.textContent=title;modalBody.replaceChildren();if(typeof body==='string')modalBody.innerHTML=body;else modalBody.appendChild(body);modal.classList.remove('hidden');}
function saveLocal(){try{localStorage.setItem(STORAGE_CODE,editor.value);localStorage.setItem(STORAGE_TITLE,currentTitle);saveState.textContent='Salvo';}catch{saveState.textContent='Não foi possível salvar';}}
function loadLocal(){try{editor.value=localStorage.getItem(STORAGE_CODE)||EXAMPLES.movimento;currentTitle=localStorage.getItem(STORAGE_TITLE)||'Meu Projeto';}catch{editor.value=EXAMPLES.movimento;currentTitle='Meu Projeto';}titleEl.textContent=currentTitle;}
function stopGame(){if(game){game.stop();game=null;}document.getElementById('engine')!.textContent='MicroConda Runtime parado';}
function runGame(){stopGame();consoleEl.textContent='';log('Compilando programa MicroConda...');try{const result=criarJogoMicroConda(editor.value,canvas);game=result.game;canvas.width=result.ast.screenWidth;canvas.height=result.ast.screenHeight;game.start();log('Executando '+result.ast.screenWidth+'x'+result.ast.screenHeight+'.');document.getElementById('engine')!.textContent='MicroConda Runtime em execução';}catch(error){log(error instanceof Error?error.message:String(error),true);document.getElementById('engine')!.textContent='Erro de execução';}}
function exportCode(){const blob=new Blob([editor.value],{type:'text/plain;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(currentTitle.replace(/[^\p{L}\p{N}_-]+/gu,'_')||'projeto')+'.micro';a.click();URL.revokeObjectURL(a.href);}
editor.addEventListener('input',()=>{saveState.textContent='Editando...';if(autosaveTimer)clearTimeout(autosaveTimer);autosaveTimer=setTimeout(saveLocal,300);});
editor.addEventListener('click',updateCursor);editor.addEventListener('keyup',updateCursor);
function updateCursor(){const before=editor.value.slice(0,editor.selectionStart);const lines=before.split('\n');cursorEl.textContent='Linha '+lines.length+', Coluna '+(lines[lines.length-1].length+1);}
document.getElementById('run')!.addEventListener('click',runGame);document.getElementById('stop')!.addEventListener('click',stopGame);document.getElementById('save')!.addEventListener('click',exportCode);document.getElementById('open')!.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',async()=>{const f=fileInput.files?.[0];if(!f)return;editor.value=await f.text();currentTitle=f.name.replace(/\.micro$/i,'')||'Meu Projeto';titleEl.textContent=currentTitle;saveLocal();});
document.getElementById('new')!.addEventListener('click',()=>{editor.value=EXAMPLES.vazio;currentTitle='Novo Projeto';titleEl.textContent=currentTitle;saveLocal();});
document.getElementById('close')!.addEventListener('click',()=>modal.classList.add('hidden'));
document.getElementById('library')!.addEventListener('click',()=>{const wrap=document.createElement('div');const intro=document.createElement('p');intro.className='muted';intro.textContent='Comandos disponíveis no MicroConda Runtime.';wrap.appendChild(intro);const grid=document.createElement('div');grid.className='grid';for(const item of MICROCONDA_LIBRARY){const card=document.createElement('div');card.className='example';const strong=document.createElement('strong');strong.textContent=item.name;const desc=document.createElement('p');desc.className='muted';desc.textContent=item.desc;const pre=document.createElement('pre');pre.textContent=item.syntax;card.append(strong,desc,pre);grid.appendChild(card);}wrap.appendChild(grid);setModal('Biblioteca MicroConda',wrap);});
document.getElementById('ai')!.addEventListener('click',()=>{const box=document.createElement('div');box.innerHTML='<p>MicroConda AI é o assistente de programação do Studio. Configure a API no servidor para geração remota.</p><pre>Pedido de exemplo: criar um jogo de labirinto com jogador controlado pelas setas.</pre>';setModal('MicroConda AI',box);});
document.getElementById('fullscreen')!.addEventListener('click',()=>{const el=document.querySelector('.screen') as HTMLElement;if(el.requestFullscreen)el.requestFullscreen().catch(()=>{});});
window.addEventListener('beforeunload',()=>{game?.stop();saveLocal();});loadLocal();updateCursor();