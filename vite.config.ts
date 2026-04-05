/**
 * ========================================================================
 * Vite Configuration
 * ========================================================================
 * Purpose: Orchestrates the asset pipeline, React transformation, and
 *          Rollup bundling specifics for extension content scripts.
 * Docs:    https://vitejs.dev/config/
 * ========================================================================
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  // ---- Plugins ----
  plugins: [react()],

  // ---- Module resolution ----
  resolve: { alias: { '@': resolve(__dirname, 'src') } },

  // ---- Build strategy ----
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: true,
    rollupOptions: {
      input: { content: resolve(__dirname, 'src/content/index.tsx'), styles: resolve(__dirname, 'src/ui/styles.scss') },
      output: { format: 'es', entryFileNames: 'js/[name].js', assetFileNames: 'ui/[name][extname]' },
    },
  },
});
