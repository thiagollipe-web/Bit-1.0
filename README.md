# NOMAD PWA

Chat educacional com IA local no navegador, biblioteca de guias, caderno e exportação. Substitui o conteúdo anterior do Bit-1.0; versões anteriores continuam no histórico Git.

## Usar
Abra https://thiagollipe-web.github.io/Bit-1.0/ e instale pelo menu do Chrome. Em Modelo, selecione Qwen2.5 0.5B ou SmolLM2 360M e toque em Baixar / carregar IA. Requer WebGPU. O primeiro download precisa de internet e pode ocupar centenas de MB. Depois do download completo, recarregue o modelo em modo avião para confirmar o cache no aparelho. O navegador pode remover dados quando falta espaço. Exporte notas e conversas regularmente.

A biblioteca e o caderno funcionam sem IA ou WebGPU após a instalação do cache. Respostas da IA aparecem progressivamente. Nenhuma pergunta é enviada a uma API de IA; downloads dos modelos usam servidores externos. O GGUF Android não é usado aqui; modelos MLC são baixados pelo WebLLM.

## Wikipédia
O botão abre https://pwa.kiwix.org/ em outra aba. O leitor e o ZIM precisam ser preparados separadamente. Alternativa Android: aplicativo Kiwix. Este projeto não inclui Wikipédia, leitor ZIM integrado ou RAG. Copie um trecho de um artigo para o chat para estudá-lo.

## Desenvolvimento
Node 22 ou superior: `npm ci`, `npm test`, `npm run build`. Sirva a pasta dist por HTTP local ou HTTPS. O workflow publica no GitHub Pages. Dependências fixadas no package-lock.json. O aplicativo e worker são empacotados localmente; não dependem de CDN de JavaScript na execução.

## Limites de validação
Sintaxe e build verificados. Teste funcional em Chromium não concluído: o download do navegador de teste falhou. Geração WebGPU no Poco e reabertura do modelo sem rede precisam de teste no dispositivo. Modelos pequenos podem errar e têm contexto limitado.

## Referências e licenças
WebLLM: https://github.com/mlc-ai/web-llm (Apache-2.0). As licenças de modelos e dependências permanecem aplicáveis. Kiwix é um projeto externo independente. Este NOMAD é um projeto educacional independente.
