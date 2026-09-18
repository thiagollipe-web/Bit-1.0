import { defineConfig, Plugin } from 'vite';
import { handleAiRequest } from './src/server/ai-assistant.ts';

function aiAssistantPlugin(): Plugin {
  return {
    name: 'ai-assistant-api',
    configureServer(server) {
      server.middlewares.use('/api/ai/assistant', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Método não permitido' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: Buffer) => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            const result = await handleAiRequest(parsed);
            res.statusCode = result.success ? 200 : 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: message || 'Erro interno no servidor' }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [aiAssistantPlugin()],
  // GitHub Pages publica o projeto em /Bit-1.0/; BASE_PATH permite sobrescrever isso em outros hosts.
  base: process.env.BASE_PATH || '/Bit-1.0/',
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 500
  },
  server: {
    port: 3000,
    host: true
  }
});
