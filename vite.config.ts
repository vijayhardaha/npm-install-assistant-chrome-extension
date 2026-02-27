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

import react from "@vitejs/plugin-react";
import type { PreRenderedChunk } from "rollup";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

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
	// 🏗️ BUILD STRATEGY
	// ==========================================
	build: {
		outDir: "dist",
		emptyOutDir: true,
		sourcemap: true,
		minify: true,
		cssCodeSplit: true,

		// --- Rollup Specifics ---
		rollupOptions: {
			input: {
				content: "src/content/index.tsx",
			},
			output: {
				// iife is essential for isolated content scripts
				format: "iife",
				entryFileNames: (chunk: PreRenderedChunk) => {
					if (chunk.name === "content") {
						return "js/content.iife.js";
					}
					return "js/[name].js";
				},
			},
		},
	},
});
