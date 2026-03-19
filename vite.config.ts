/**
 * ###############################################################################
 * __      _______ _______ ______
 * \ \    / /_   _|__   __|  ____|
 * \ \  / /  | |    | |  | |__
 * \ \/ /   | |    | |  |  __|
 * \  /   _| |_   | |  | |____
 * \/   |_____|  |_|  |______|
 *
 * THE BUILD ENGINE (Vite)
 * ###############################################################################
 * PURPOSE:
 * Orchestrates the asset pipeline, React transformation, and specific
 * Rollup bundling requirements for extensions/content scripts.
 * ###############################################################################
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
	// ==========================================
	// 🔌 PLUGINS
	// ==========================================
	plugins: [
		react(),
		viteStaticCopy({
			targets: [
				{ src: "src/manifest.json", dest: "." },
				{ src: "src/assets/*", dest: "assets" },
			],
		}),
	],

	// ==========================================
	// MODULE RESOLUTION
	// ==========================================
	// Preserve @ alias parity with editor jsconfig settings.
	resolve: { alias: { "@": resolve(__dirname, "src") } },

	// ==========================================
	// 🏗️ BUILD STRATEGY
	// ==========================================
	build: {
		outDir: "dist",
		emptyOutDir: true,
		sourcemap: true,
		minify: true,

		// --- Rollup Specifics ---
		rollupOptions: {
			input: {
				content: resolve(__dirname, "src/content/index.tsx"),
				styles: resolve(__dirname, "src/ui/styles.scss")
			},
			output: {
				format: "es",
				entryFileNames: "js/[name].js",
				assetFileNames: "ui/[name][extname]",
			},
		},
	},
});
