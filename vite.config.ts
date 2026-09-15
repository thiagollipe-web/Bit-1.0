import { defineConfig } from 'vite';

export default defineConfig({
  // Base path: configured for root serving in AI Studio while preserving base: '/Bit-1.0/' for GitHub Pages
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
