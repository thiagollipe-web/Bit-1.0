import {CreateWebWorkerMLCEngine} from '@mlc-ai/web-llm';
let engine=null, worker=null;
let loadTimer=null;
const state={ready:false,busy:false,message:'Baixe e carregue o modelo na aba Modelo.',model:'',wiki:'A Wikipédia completa é consultada separadamente no Kiwix.'};
function status(message){state.message=message;window.dispatchEvent(new CustomEvent('nomad-status'));}
window.NomadNative={
 getStatus:()=>JSON.stringify(state),
 async importModel(){
  if(state.busy)return;
  state.busy=true;state.ready=false;status('Verificando WebGPU…');
  try{
   const adapter=navigator.gpu?await navigator.gpu.requestAdapter():null;
   if(!adapter)throw new Error('WebGPU não está disponível neste navegador. Use Chrome atualizado em um aparelho compatível. Biblioteca e caderno continuam funcionando.');
   await navigator.storage?.persist?.();
   if(engine)await engine.unload();worker?.terminate();
   worker=new Worker(new URL('./ai-worker.js',location.href),{type:'module'});
   let model=document.getElementById('modelSelect').value;
   if(!adapter.features.has('shader-f16'))model=model.replace('q4f16_1','q4f32_1');
   status('Carregando '+model+'… Mantenha esta tela aberta.');
   const loadingFailure=new Promise((resolve,reject)=>{
    const resetTimer=()=>{clearTimeout(loadTimer);loadTimer=setTimeout(()=>reject(new Error('O carregamento ficou sem progresso por 3 minutos. Verifique a conexão e tente novamente.')),180000);};
    resetTimer();
    worker.addEventListener('error',e=>reject(new Error(e.message||'O motor de IA falhou ao iniciar.')),{once:true});
    worker.addEventListener('messageerror',()=>reject(new Error('Falha na comunicação com o motor de IA.')),{once:true});
    window.nomadLoadProgress=p=>{resetTimer();status(p.text);};
   });
   engine=await Promise.race([CreateWebWorkerMLCEngine(worker,model,{initProgressCallback:p=>window.nomadLoadProgress(p)},{context_window_size:1024}),loadingFailure]);
   state.ready=true;state.model=model;status('IA local pronta. Teste em modo avião para confirmar o cache neste aparelho.');
  }catch(e){engine=null;worker?.terminate();worker=null;status('Não foi possível carregar: '+e.message);}
  finally{clearTimeout(loadTimer);state.busy=false;status(state.message);}
 },
 async chat(id,text){
  let content='';state.busy=true;
  try{
   if(!engine||!state.ready)throw new Error('Carregue o modelo primeiro.');
   const messages=JSON.parse(text).slice(-4).map(m=>({role:m.role,content:m.content.slice(0,500)}));
   const chunks=await engine.chat.completions.create({messages:[{role:'system',content:'Você é NOMAD, um assistente educacional. Responda em português de forma curta e clara. Se não souber, diga. Ajude a aprender com exemplos.'},...messages],stream:true,max_tokens:384,temperature:0.6,repetition_penalty:1.15});
   for await(const chunk of chunks){content+=chunk.choices[0]?.delta?.content||'';window.dispatchEvent(new CustomEvent('nomad-chunk',{detail:{id,content}}));}
   window.dispatchEvent(new CustomEvent('nomad-result',{detail:{id,content:content||'Geração interrompida sem texto.'}}));
  }catch(e){window.dispatchEvent(new CustomEvent('nomad-result',{detail:{id,error:'Falha na IA: '+e.message}}));}
  finally{state.busy=false;status(state.message);}
 },
 cancel(){engine?.interruptGenerate();},
 openWikipedia(){window.open('https://pwa.kiwix.org/','_blank','noopener,noreferrer');}
};
let installPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;document.getElementById('install').hidden=false;});
document.getElementById('install').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;document.getElementById('install').hidden=true;}};
if('serviceWorker' in navigator){
 navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(()=>navigator.serviceWorker.ready).then(()=>{document.getElementById('offlineStatus').textContent='Interface instalada no cache. Biblioteca e caderno disponíveis offline.';}).catch(e=>{document.getElementById('offlineStatus').textContent='Não foi possível preparar o modo offline: '+e.message;});
}
