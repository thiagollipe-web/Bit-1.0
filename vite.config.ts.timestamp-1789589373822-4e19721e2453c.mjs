// vite.config.ts
import { defineConfig } from "file:///app/applet/node_modules/vite/dist/node/index.js";

// src/server/ai-assistant.ts
import { GoogleGenAI, ThinkingLevel } from "file:///app/applet/node_modules/@google/genai/dist/node/index.mjs";
var aiClient = null;
function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Chave GEMINI_API_KEY n\xE3o configurada no ambiente.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
var BIT_SYSTEM_INSTRUCTION = `Voc\xEA \xE9 o assistente de programa\xE7\xE3o especialista na linguagem BIT 1.2 (uma linguagem textual brasileira para cria\xE7\xE3o de jogos 2D).
Sua miss\xE3o \xE9 ajudar o desenvolvedor a criar, corrigir, otimizar e entender programas e jogos escritos em BIT (.bit).

REGRAS SINT\xC1TICAS E GRAMATICAIS DA LINGUAGEM BIT 1.2:
1. Dimens\xE3o da tela:
   tela 160x120
   fundo preto (cores v\xE1lidas: preto, branco, vermelho, verde, azul, amarelo, ciano, magenta, cinza, laranja, roxo, rosa, marrom, invisivel)

2. Declara\xE7\xE3o de Vari\xE1veis:
   pontos recebe 0
   # ou: pontos = 0

3. Declara\xE7\xE3o de Atores:
   ator NomeDoAtor
     desenho quadrado 8, verde
     # ou: desenho ret\xE2ngulo 16, 6, azul
     # ou: desenho circulo 5, amarelo
     # ou: desenho texto 10, "Texto", branco
     posi\xE7\xE3o 76, 56
     velocidade 1.5, 2.0
     controlado por setas
     limita \xE0 tela
     quica nas bordas
     quando atualiza:
       # c\xF3digo a cada quadro
     fim
     quando colide com "OutroAtor":
       # c\xF3digo executado ao colidir
     fim
   fim

4. Estruturas de Controle:
   se condi\xE7\xE3o ent\xE3o
     # comandos
   sen\xE3o se outra_condi\xE7\xE3o ent\xE3o
     # comandos
   sen\xE3o
     # comandos
   fim

   repita 5 vezes
     # comandos
   fim

   enquanto condi\xE7\xE3o fa\xE7a
     # comandos
   fim

5. Fun\xE7\xF5es:
   fun\xE7\xE3o somar(a, b)
     retorne a + b
   fim

6. Mensagens no Console:
   diga "Mensagem aqui"
   diga "Pontos: " + pontos

7. Fun\xE7\xF5es Embutidas (Built-ins):
   - aleatorio(min, max): n\xFAmero aleat\xF3rio entre min e max
   - distancia(x1, y1, x2, y2): dist\xE2ncia euclidiana entre dois pontos
   - tecla("arrowup"), tecla("arrowdown"), tecla("arrowleft"), tecla("arrowright"), tecla("espaco"), tecla("a"), tecla("w"), etc.
   - tempo(): tempo decorrido em segundos
   - seno(graus), cosseno(graus), raiz(val), absoluto(val), arredonda(val), piso(val), teto(val)

8. Propriedades de Atores:
   Dentro do pr\xF3prio ator: x, y, vx, vy, largura, altura, ativo.
   Acessando outro ator: NomeDoAtor.x, NomeDoAtor.y, etc.

DIRETRIZES DE RESPOSTA:
- Sempre responda em portugu\xEAs claro e amig\xE1vel.
- Quando fornecer c\xF3digo BIT, coloque-o dentro de blocos de c\xF3digo markdown com marcador \`\`\`bit.
- Certifique-se de que TODO c\xF3digo .bit gerado siga rigorosamente a sintaxe acima (termine blocos com 'fim', use 'se ... ent\xE3o', 'quando atualiza:', etc.).
- Se o usu\xE1rio pedir um jogo novo, forne\xE7a o c\xF3digo completo e execut\xE1vel.
- Se o usu\xE1rio pedir para corrigir ou adicionar uma funcionalidade, explique brevemente a altera\xE7\xE3o e mostre o c\xF3digo pronto.`;
async function handleAiRequest(body) {
  const { prompt, currentCode, action } = body;
  if (!prompt && !action) {
    return { success: false, error: "Pergunta ou solicita\xE7\xE3o n\xE3o fornecida." };
  }
  const ai = getAiClient();
  let userMessage = prompt || "";
  if (action === "explain") {
    userMessage = `Explique em detalhes como funciona o seguinte c\xF3digo BIT, quais s\xE3o os atores e qual a l\xF3gica de jogo:
\`\`\`bit
${currentCode || ""}
\`\`\``;
  } else if (action === "fix") {
    userMessage = `Analise o c\xF3digo BIT abaixo, identifique poss\xEDveis erros sint\xE1ticos ou l\xF3gicos de colis\xE3o/movimento, e forne\xE7a a vers\xE3o corrigida completa e funcional:
\`\`\`bit
${currentCode || ""}
\`\`\`
Instru\xE7\xE3o adicional: ${prompt || "Corrija erros e deixe o jogo funcionando perfeitamente."}`;
  } else if (action === "add_feature") {
    userMessage = `Com base no c\xF3digo BIT atual abaixo, implemente a seguinte funcionalidade: "${prompt}". Retorne o c\xF3digo atualizado completo:
\`\`\`bit
${currentCode || ""}
\`\`\``;
  } else if (action === "new_game") {
    userMessage = `Crie um novo jogo 2D completo na linguagem BIT de acordo com o pedido: "${prompt}". O jogo deve ser divertido, ter tela 160x120, atores com desenhos coloridos, movimento, colis\xF5es e pontua\xE7\xE3o ou objetivo claro.`;
  } else if (currentCode && currentCode.trim().length > 0) {
    userMessage = `${prompt}

[C\xF3digo BIT atual no editor]:
\`\`\`bit
${currentCode}
\`\`\``;
  }
  const models = ["gemini-3.6-flash", "gemini-3.8-flash", "gemini-flash-latest"];
  let lastError = null;
  let replyText = "";
  for (const model of models) {
    try {
      const result = await ai.models.generateContent({
        model,
        contents: userMessage,
        config: {
          systemInstruction: BIT_SYSTEM_INSTRUCTION,
          temperature: 0.7,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });
      if (result.text) {
        replyText = result.text;
        break;
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    }
  }
  if (!replyText) {
    return {
      success: false,
      error: lastError ? `Erro ao consultar a IA: ${lastError.message}` : "N\xE3o foi poss\xEDvel gerar resposta no momento."
    };
  }
  let extractedCode = "";
  const bitCodeRegex = /```(?:bit)?\s*([\s\S]*?)```/i;
  const match = replyText.match(bitCodeRegex);
  if (match && match[1]) {
    extractedCode = match[1].trim();
  }
  return {
    success: true,
    reply: replyText,
    extractedCode: extractedCode || void 0
  };
}

// vite.config.ts
function aiAssistantPlugin() {
  return {
    name: "ai-assistant-api",
    configureServer(server) {
      server.middlewares.use("/api/ai/assistant", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: false, error: "M\xE9todo n\xE3o permitido" }));
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", async () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            const result = await handleAiRequest(parsed);
            res.statusCode = result.success ? 200 : 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: false, error: message || "Erro interno no servidor" }));
          }
        });
      });
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [aiAssistantPlugin()],
  // Base path: configured for root serving in AI Studio while preserving base: '/Bit-1.0/' for GitHub Pages
  base: process.env.BASE_PATH || "./",
  build: {
    target: "es2022",
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    chunkSizeWarningLimit: 500
  },
  server: {
    port: 3e3,
    host: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL3NlcnZlci9haS1hc3Npc3RhbnQudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwL2FwcGxldFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2FwcC9hcHBsZXQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2FwcC9hcHBsZXQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgaGFuZGxlQWlSZXF1ZXN0IH0gZnJvbSAnLi9zcmMvc2VydmVyL2FpLWFzc2lzdGFudC50cyc7XG5cbmZ1bmN0aW9uIGFpQXNzaXN0YW50UGx1Z2luKCk6IFBsdWdpbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2FpLWFzc2lzdGFudC1hcGknLFxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGkvYWkvYXNzaXN0YW50JywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnUE9TVCcpIHtcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNTtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdNXHUwMEU5dG9kbyBuXHUwMEUzbyBwZXJtaXRpZG8nIH0pKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYm9keSA9ICcnO1xuICAgICAgICByZXEub24oJ2RhdGEnLCAoY2h1bms6IEJ1ZmZlcikgPT4ge1xuICAgICAgICAgIGJvZHkgKz0gY2h1bmsudG9TdHJpbmcoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVxLm9uKCdlbmQnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IGJvZHkgPyBKU09OLnBhcnNlKGJvZHkpIDoge307XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBoYW5kbGVBaVJlcXVlc3QocGFyc2VkKTtcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gcmVzdWx0LnN1Y2Nlc3MgPyAyMDAgOiA1MDA7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeShyZXN1bHQpKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycik7XG4gICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMDtcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBtZXNzYWdlIHx8ICdFcnJvIGludGVybm8gbm8gc2Vydmlkb3InIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbYWlBc3Npc3RhbnRQbHVnaW4oKV0sXG4gIC8vIEJhc2UgcGF0aDogY29uZmlndXJlZCBmb3Igcm9vdCBzZXJ2aW5nIGluIEFJIFN0dWRpbyB3aGlsZSBwcmVzZXJ2aW5nIGJhc2U6ICcvQml0LTEuMC8nIGZvciBHaXRIdWIgUGFnZXNcbiAgYmFzZTogcHJvY2Vzcy5lbnYuQkFTRV9QQVRIIHx8ICcuLycsXG4gIGJ1aWxkOiB7XG4gICAgdGFyZ2V0OiAnZXMyMDIyJyxcbiAgICBvdXREaXI6ICdkaXN0JyxcbiAgICBhc3NldHNEaXI6ICdhc3NldHMnLFxuICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA1MDBcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogMzAwMCxcbiAgICBob3N0OiB0cnVlXG4gIH1cbn0pO1xuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9hcHAvYXBwbGV0L3NyYy9zZXJ2ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9hcHAvYXBwbGV0L3NyYy9zZXJ2ZXIvYWktYXNzaXN0YW50LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9hcHAvYXBwbGV0L3NyYy9zZXJ2ZXIvYWktYXNzaXN0YW50LnRzXCI7aW1wb3J0IHsgR29vZ2xlR2VuQUksIFRoaW5raW5nTGV2ZWwgfSBmcm9tICdAZ29vZ2xlL2dlbmFpJztcblxubGV0IGFpQ2xpZW50OiBHb29nbGVHZW5BSSB8IG51bGwgPSBudWxsO1xuXG5mdW5jdGlvbiBnZXRBaUNsaWVudCgpOiBHb29nbGVHZW5BSSB7XG4gIGlmICghYWlDbGllbnQpIHtcbiAgICBjb25zdCBhcGlLZXkgPSBwcm9jZXNzLmVudi5HRU1JTklfQVBJX0tFWTtcbiAgICBpZiAoIWFwaUtleSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDaGF2ZSBHRU1JTklfQVBJX0tFWSBuXHUwMEUzbyBjb25maWd1cmFkYSBubyBhbWJpZW50ZS4nKTtcbiAgICB9XG4gICAgYWlDbGllbnQgPSBuZXcgR29vZ2xlR2VuQUkoe1xuICAgICAgYXBpS2V5LFxuICAgICAgaHR0cE9wdGlvbnM6IHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdVc2VyLUFnZW50JzogJ2Fpc3R1ZGlvLWJ1aWxkJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGFpQ2xpZW50O1xufVxuXG5jb25zdCBCSVRfU1lTVEVNX0lOU1RSVUNUSU9OID0gYFZvY1x1MDBFQSBcdTAwRTkgbyBhc3Npc3RlbnRlIGRlIHByb2dyYW1hXHUwMEU3XHUwMEUzbyBlc3BlY2lhbGlzdGEgbmEgbGluZ3VhZ2VtIEJJVCAxLjIgKHVtYSBsaW5ndWFnZW0gdGV4dHVhbCBicmFzaWxlaXJhIHBhcmEgY3JpYVx1MDBFN1x1MDBFM28gZGUgam9nb3MgMkQpLlxuU3VhIG1pc3NcdTAwRTNvIFx1MDBFOSBhanVkYXIgbyBkZXNlbnZvbHZlZG9yIGEgY3JpYXIsIGNvcnJpZ2lyLCBvdGltaXphciBlIGVudGVuZGVyIHByb2dyYW1hcyBlIGpvZ29zIGVzY3JpdG9zIGVtIEJJVCAoLmJpdCkuXG5cblJFR1JBUyBTSU5UXHUwMEMxVElDQVMgRSBHUkFNQVRJQ0FJUyBEQSBMSU5HVUFHRU0gQklUIDEuMjpcbjEuIERpbWVuc1x1MDBFM28gZGEgdGVsYTpcbiAgIHRlbGEgMTYweDEyMFxuICAgZnVuZG8gcHJldG8gKGNvcmVzIHZcdTAwRTFsaWRhczogcHJldG8sIGJyYW5jbywgdmVybWVsaG8sIHZlcmRlLCBhenVsLCBhbWFyZWxvLCBjaWFubywgbWFnZW50YSwgY2luemEsIGxhcmFuamEsIHJveG8sIHJvc2EsIG1hcnJvbSwgaW52aXNpdmVsKVxuXG4yLiBEZWNsYXJhXHUwMEU3XHUwMEUzbyBkZSBWYXJpXHUwMEUxdmVpczpcbiAgIHBvbnRvcyByZWNlYmUgMFxuICAgIyBvdTogcG9udG9zID0gMFxuXG4zLiBEZWNsYXJhXHUwMEU3XHUwMEUzbyBkZSBBdG9yZXM6XG4gICBhdG9yIE5vbWVEb0F0b3JcbiAgICAgZGVzZW5obyBxdWFkcmFkbyA4LCB2ZXJkZVxuICAgICAjIG91OiBkZXNlbmhvIHJldFx1MDBFMm5ndWxvIDE2LCA2LCBhenVsXG4gICAgICMgb3U6IGRlc2VuaG8gY2lyY3VsbyA1LCBhbWFyZWxvXG4gICAgICMgb3U6IGRlc2VuaG8gdGV4dG8gMTAsIFwiVGV4dG9cIiwgYnJhbmNvXG4gICAgIHBvc2lcdTAwRTdcdTAwRTNvIDc2LCA1NlxuICAgICB2ZWxvY2lkYWRlIDEuNSwgMi4wXG4gICAgIGNvbnRyb2xhZG8gcG9yIHNldGFzXG4gICAgIGxpbWl0YSBcdTAwRTAgdGVsYVxuICAgICBxdWljYSBuYXMgYm9yZGFzXG4gICAgIHF1YW5kbyBhdHVhbGl6YTpcbiAgICAgICAjIGNcdTAwRjNkaWdvIGEgY2FkYSBxdWFkcm9cbiAgICAgZmltXG4gICAgIHF1YW5kbyBjb2xpZGUgY29tIFwiT3V0cm9BdG9yXCI6XG4gICAgICAgIyBjXHUwMEYzZGlnbyBleGVjdXRhZG8gYW8gY29saWRpclxuICAgICBmaW1cbiAgIGZpbVxuXG40LiBFc3RydXR1cmFzIGRlIENvbnRyb2xlOlxuICAgc2UgY29uZGlcdTAwRTdcdTAwRTNvIGVudFx1MDBFM29cbiAgICAgIyBjb21hbmRvc1xuICAgc2VuXHUwMEUzbyBzZSBvdXRyYV9jb25kaVx1MDBFN1x1MDBFM28gZW50XHUwMEUzb1xuICAgICAjIGNvbWFuZG9zXG4gICBzZW5cdTAwRTNvXG4gICAgICMgY29tYW5kb3NcbiAgIGZpbVxuXG4gICByZXBpdGEgNSB2ZXplc1xuICAgICAjIGNvbWFuZG9zXG4gICBmaW1cblxuICAgZW5xdWFudG8gY29uZGlcdTAwRTdcdTAwRTNvIGZhXHUwMEU3YVxuICAgICAjIGNvbWFuZG9zXG4gICBmaW1cblxuNS4gRnVuXHUwMEU3XHUwMEY1ZXM6XG4gICBmdW5cdTAwRTdcdTAwRTNvIHNvbWFyKGEsIGIpXG4gICAgIHJldG9ybmUgYSArIGJcbiAgIGZpbVxuXG42LiBNZW5zYWdlbnMgbm8gQ29uc29sZTpcbiAgIGRpZ2EgXCJNZW5zYWdlbSBhcXVpXCJcbiAgIGRpZ2EgXCJQb250b3M6IFwiICsgcG9udG9zXG5cbjcuIEZ1blx1MDBFN1x1MDBGNWVzIEVtYnV0aWRhcyAoQnVpbHQtaW5zKTpcbiAgIC0gYWxlYXRvcmlvKG1pbiwgbWF4KTogblx1MDBGQW1lcm8gYWxlYXRcdTAwRjNyaW8gZW50cmUgbWluIGUgbWF4XG4gICAtIGRpc3RhbmNpYSh4MSwgeTEsIHgyLCB5Mik6IGRpc3RcdTAwRTJuY2lhIGV1Y2xpZGlhbmEgZW50cmUgZG9pcyBwb250b3NcbiAgIC0gdGVjbGEoXCJhcnJvd3VwXCIpLCB0ZWNsYShcImFycm93ZG93blwiKSwgdGVjbGEoXCJhcnJvd2xlZnRcIiksIHRlY2xhKFwiYXJyb3dyaWdodFwiKSwgdGVjbGEoXCJlc3BhY29cIiksIHRlY2xhKFwiYVwiKSwgdGVjbGEoXCJ3XCIpLCBldGMuXG4gICAtIHRlbXBvKCk6IHRlbXBvIGRlY29ycmlkbyBlbSBzZWd1bmRvc1xuICAgLSBzZW5vKGdyYXVzKSwgY29zc2VubyhncmF1cyksIHJhaXoodmFsKSwgYWJzb2x1dG8odmFsKSwgYXJyZWRvbmRhKHZhbCksIHBpc28odmFsKSwgdGV0byh2YWwpXG5cbjguIFByb3ByaWVkYWRlcyBkZSBBdG9yZXM6XG4gICBEZW50cm8gZG8gcHJcdTAwRjNwcmlvIGF0b3I6IHgsIHksIHZ4LCB2eSwgbGFyZ3VyYSwgYWx0dXJhLCBhdGl2by5cbiAgIEFjZXNzYW5kbyBvdXRybyBhdG9yOiBOb21lRG9BdG9yLngsIE5vbWVEb0F0b3IueSwgZXRjLlxuXG5ESVJFVFJJWkVTIERFIFJFU1BPU1RBOlxuLSBTZW1wcmUgcmVzcG9uZGEgZW0gcG9ydHVndVx1MDBFQXMgY2xhcm8gZSBhbWlnXHUwMEUxdmVsLlxuLSBRdWFuZG8gZm9ybmVjZXIgY1x1MDBGM2RpZ28gQklULCBjb2xvcXVlLW8gZGVudHJvIGRlIGJsb2NvcyBkZSBjXHUwMEYzZGlnbyBtYXJrZG93biBjb20gbWFyY2Fkb3IgXFxgXFxgXFxgYml0LlxuLSBDZXJ0aWZpcXVlLXNlIGRlIHF1ZSBUT0RPIGNcdTAwRjNkaWdvIC5iaXQgZ2VyYWRvIHNpZ2Egcmlnb3Jvc2FtZW50ZSBhIHNpbnRheGUgYWNpbWEgKHRlcm1pbmUgYmxvY29zIGNvbSAnZmltJywgdXNlICdzZSAuLi4gZW50XHUwMEUzbycsICdxdWFuZG8gYXR1YWxpemE6JywgZXRjLikuXG4tIFNlIG8gdXN1XHUwMEUxcmlvIHBlZGlyIHVtIGpvZ28gbm92bywgZm9ybmVcdTAwRTdhIG8gY1x1MDBGM2RpZ28gY29tcGxldG8gZSBleGVjdXRcdTAwRTF2ZWwuXG4tIFNlIG8gdXN1XHUwMEUxcmlvIHBlZGlyIHBhcmEgY29ycmlnaXIgb3UgYWRpY2lvbmFyIHVtYSBmdW5jaW9uYWxpZGFkZSwgZXhwbGlxdWUgYnJldmVtZW50ZSBhIGFsdGVyYVx1MDBFN1x1MDBFM28gZSBtb3N0cmUgbyBjXHUwMEYzZGlnbyBwcm9udG8uYDtcblxuZXhwb3J0IGludGVyZmFjZSBBc3Npc3RhbnRSZXF1ZXN0IHtcbiAgcHJvbXB0OiBzdHJpbmc7XG4gIGN1cnJlbnRDb2RlPzogc3RyaW5nO1xuICBhY3Rpb24/OiAnY3VzdG9tJyB8ICdleHBsYWluJyB8ICdmaXgnIHwgJ2FkZF9mZWF0dXJlJyB8ICduZXdfZ2FtZSc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXNzaXN0YW50UmVzcG9uc2Uge1xuICBzdWNjZXNzOiBib29sZWFuO1xuICByZXBseT86IHN0cmluZztcbiAgZXh0cmFjdGVkQ29kZT86IHN0cmluZztcbiAgZXJyb3I/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVBaVJlcXVlc3QoYm9keTogQXNzaXN0YW50UmVxdWVzdCk6IFByb21pc2U8QXNzaXN0YW50UmVzcG9uc2U+IHtcbiAgY29uc3QgeyBwcm9tcHQsIGN1cnJlbnRDb2RlLCBhY3Rpb24gfSA9IGJvZHk7XG5cbiAgaWYgKCFwcm9tcHQgJiYgIWFjdGlvbikge1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1Blcmd1bnRhIG91IHNvbGljaXRhXHUwMEU3XHUwMEUzbyBuXHUwMEUzbyBmb3JuZWNpZGEuJyB9O1xuICB9XG5cbiAgY29uc3QgYWkgPSBnZXRBaUNsaWVudCgpO1xuXG4gIGxldCB1c2VyTWVzc2FnZSA9IHByb21wdCB8fCAnJztcbiAgaWYgKGFjdGlvbiA9PT0gJ2V4cGxhaW4nKSB7XG4gICAgdXNlck1lc3NhZ2UgPSBgRXhwbGlxdWUgZW0gZGV0YWxoZXMgY29tbyBmdW5jaW9uYSBvIHNlZ3VpbnRlIGNcdTAwRjNkaWdvIEJJVCwgcXVhaXMgc1x1MDBFM28gb3MgYXRvcmVzIGUgcXVhbCBhIGxcdTAwRjNnaWNhIGRlIGpvZ286XFxuXFxgXFxgXFxgYml0XFxuJHtjdXJyZW50Q29kZSB8fCAnJ31cXG5cXGBcXGBcXGBgO1xuICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ2ZpeCcpIHtcbiAgICB1c2VyTWVzc2FnZSA9IGBBbmFsaXNlIG8gY1x1MDBGM2RpZ28gQklUIGFiYWl4bywgaWRlbnRpZmlxdWUgcG9zc1x1MDBFRHZlaXMgZXJyb3Mgc2ludFx1MDBFMXRpY29zIG91IGxcdTAwRjNnaWNvcyBkZSBjb2xpc1x1MDBFM28vbW92aW1lbnRvLCBlIGZvcm5lXHUwMEU3YSBhIHZlcnNcdTAwRTNvIGNvcnJpZ2lkYSBjb21wbGV0YSBlIGZ1bmNpb25hbDpcXG5cXGBcXGBcXGBiaXRcXG4ke2N1cnJlbnRDb2RlIHx8ICcnfVxcblxcYFxcYFxcYFxcbkluc3RydVx1MDBFN1x1MDBFM28gYWRpY2lvbmFsOiAke3Byb21wdCB8fCAnQ29ycmlqYSBlcnJvcyBlIGRlaXhlIG8gam9nbyBmdW5jaW9uYW5kbyBwZXJmZWl0YW1lbnRlLid9YDtcbiAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICdhZGRfZmVhdHVyZScpIHtcbiAgICB1c2VyTWVzc2FnZSA9IGBDb20gYmFzZSBubyBjXHUwMEYzZGlnbyBCSVQgYXR1YWwgYWJhaXhvLCBpbXBsZW1lbnRlIGEgc2VndWludGUgZnVuY2lvbmFsaWRhZGU6IFwiJHtwcm9tcHR9XCIuIFJldG9ybmUgbyBjXHUwMEYzZGlnbyBhdHVhbGl6YWRvIGNvbXBsZXRvOlxcblxcYFxcYFxcYGJpdFxcbiR7Y3VycmVudENvZGUgfHwgJyd9XFxuXFxgXFxgXFxgYDtcbiAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICduZXdfZ2FtZScpIHtcbiAgICB1c2VyTWVzc2FnZSA9IGBDcmllIHVtIG5vdm8gam9nbyAyRCBjb21wbGV0byBuYSBsaW5ndWFnZW0gQklUIGRlIGFjb3JkbyBjb20gbyBwZWRpZG86IFwiJHtwcm9tcHR9XCIuIE8gam9nbyBkZXZlIHNlciBkaXZlcnRpZG8sIHRlciB0ZWxhIDE2MHgxMjAsIGF0b3JlcyBjb20gZGVzZW5ob3MgY29sb3JpZG9zLCBtb3ZpbWVudG8sIGNvbGlzXHUwMEY1ZXMgZSBwb250dWFcdTAwRTdcdTAwRTNvIG91IG9iamV0aXZvIGNsYXJvLmA7XG4gIH0gZWxzZSBpZiAoY3VycmVudENvZGUgJiYgY3VycmVudENvZGUudHJpbSgpLmxlbmd0aCA+IDApIHtcbiAgICB1c2VyTWVzc2FnZSA9IGAke3Byb21wdH1cXG5cXG5bQ1x1MDBGM2RpZ28gQklUIGF0dWFsIG5vIGVkaXRvcl06XFxuXFxgXFxgXFxgYml0XFxuJHtjdXJyZW50Q29kZX1cXG5cXGBcXGBcXGBgO1xuICB9XG5cbiAgLy8gUHJlZmVycmVkIG1vZGVscyB0byB0cnkgaW4gb3JkZXJcbiAgY29uc3QgbW9kZWxzID0gWydnZW1pbmktMy42LWZsYXNoJywgJ2dlbWluaS0zLjgtZmxhc2gnLCAnZ2VtaW5pLWZsYXNoLWxhdGVzdCddO1xuICBsZXQgbGFzdEVycm9yOiBFcnJvciB8IG51bGwgPSBudWxsO1xuICBsZXQgcmVwbHlUZXh0ID0gJyc7XG5cbiAgZm9yIChjb25zdCBtb2RlbCBvZiBtb2RlbHMpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYWkubW9kZWxzLmdlbmVyYXRlQ29udGVudCh7XG4gICAgICAgIG1vZGVsLFxuICAgICAgICBjb250ZW50czogdXNlck1lc3NhZ2UsXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIHN5c3RlbUluc3RydWN0aW9uOiBCSVRfU1lTVEVNX0lOU1RSVUNUSU9OLFxuICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjcsXG4gICAgICAgICAgdGhpbmtpbmdDb25maWc6IHsgdGhpbmtpbmdMZXZlbDogVGhpbmtpbmdMZXZlbC5MT1cgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKHJlc3VsdC50ZXh0KSB7XG4gICAgICAgIHJlcGx5VGV4dCA9IHJlc3VsdC50ZXh0O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxhc3RFcnJvciA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyIDogbmV3IEVycm9yKFN0cmluZyhlcnIpKTtcbiAgICAgIC8vIFRyeSBuZXh0IG1vZGVsIGlmIGF2YWlsYWJsZVxuICAgICAgY29udGludWU7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFyZXBseVRleHQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICBlcnJvcjogbGFzdEVycm9yID8gYEVycm8gYW8gY29uc3VsdGFyIGEgSUE6ICR7bGFzdEVycm9yLm1lc3NhZ2V9YCA6ICdOXHUwMEUzbyBmb2kgcG9zc1x1MDBFRHZlbCBnZXJhciByZXNwb3N0YSBubyBtb21lbnRvLidcbiAgICB9O1xuICB9XG5cbiAgLy8gRXh0cmFjdCAuYml0IGNvZGUgYmxvY2sgaWYgcHJlc2VudFxuICBsZXQgZXh0cmFjdGVkQ29kZSA9ICcnO1xuICBjb25zdCBiaXRDb2RlUmVnZXggPSAvYGBgKD86Yml0KT9cXHMqKFtcXHNcXFNdKj8pYGBgL2k7XG4gIGNvbnN0IG1hdGNoID0gcmVwbHlUZXh0Lm1hdGNoKGJpdENvZGVSZWdleCk7XG4gIGlmIChtYXRjaCAmJiBtYXRjaFsxXSkge1xuICAgIGV4dHJhY3RlZENvZGUgPSBtYXRjaFsxXS50cmltKCk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgcmVwbHk6IHJlcGx5VGV4dCxcbiAgICBleHRyYWN0ZWRDb2RlOiBleHRyYWN0ZWRDb2RlIHx8IHVuZGVmaW5lZFxuICB9O1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtTixTQUFTLG9CQUE0Qjs7O0FDQUYsU0FBUyxhQUFhLHFCQUFxQjtBQUVqUyxJQUFJLFdBQStCO0FBRW5DLFNBQVMsY0FBMkI7QUFDbEMsTUFBSSxDQUFDLFVBQVU7QUFDYixVQUFNLFNBQVMsUUFBUSxJQUFJO0FBQzNCLFFBQUksQ0FBQyxRQUFRO0FBQ1gsWUFBTSxJQUFJLE1BQU0sc0RBQW1EO0FBQUEsSUFDckU7QUFDQSxlQUFXLElBQUksWUFBWTtBQUFBLE1BQ3pCO0FBQUEsTUFDQSxhQUFhO0FBQUEsUUFDWCxTQUFTO0FBQUEsVUFDUCxjQUFjO0FBQUEsUUFDaEI7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUNBLFNBQU87QUFDVDtBQUVBLElBQU0seUJBQXlCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUF3Ri9CLGVBQXNCLGdCQUFnQixNQUFvRDtBQUN4RixRQUFNLEVBQUUsUUFBUSxh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
