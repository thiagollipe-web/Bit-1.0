import { defineConfig } from 'vite';

export default defineConfig({
  base: '/objetos/',
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
