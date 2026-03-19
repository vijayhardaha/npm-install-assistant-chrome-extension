/**
 * ========================================================================
 * Vite Configuration
 * ========================================================================
 * Purpose: Orchestrates the asset pipeline, React transformation, and
 *          Rollup bundling specifics for extension content scripts.
 * Docs: https://vitejs.dev/config/
 * ========================================================================
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  // ---- Plugins ----
  // Register Vite plugins: React transformer and static asset copy helper
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'src/manifest.json', dest: '.' },
        { src: 'src/assets/*', dest: 'assets' },
      ],
    }),
  ],

  // ---- Module resolution ----
  // Preserve @ alias parity with editor jsconfig/tsconfig settings
  resolve: { alias: { '@': resolve(__dirname, 'src') } },

  // ---- Build strategy ----
  // Output directory, sourcemap, minification and Rollup options
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: true,

    // ---- Rollup specifics ----
    // Inputs and output file naming for the extension bundles
    rollupOptions: {
      input: { content: resolve(__dirname, 'src/content/index.tsx'), styles: resolve(__dirname, 'src/ui/styles.scss') },
      output: { format: 'es', entryFileNames: 'js/[name].js', assetFileNames: 'ui/[name][extname]' },
    },
  },
});
