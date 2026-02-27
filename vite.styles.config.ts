/**
 * ###############################################################################
 * _____ _______ __     __ _      ______  _____
 * / ____|__   __|\ \   / /| |    |  ____|/ ____|
 * | (___    | |    \ \_/ / | |    | |__  | (___
 * \___ \   | |     \   /  | |    |  __|  \___ \
 * ____) |  | |      | |   | |____| |____ ____) |
 * |_____/   |_|      |_|   |______|______|_____/
 *
 * THE STYLE BUNDLER (Vite)
 * ###############################################################################
 * PURPOSE:
 * A specialized build pipeline dedicated to processing SCSS/CSS independently.
 * Ensures global styles are compiled, minified, and mapped correctly.
 * ###############################################################################
 */

import { defineConfig } from "vite";

export default defineConfig({
	build: {
		// ==========================================
		// 🏗️ BUILD OUTPUT
		// ==========================================
		outDir: "dist",

		// IMPORTANT: Set to false so it doesn't delete the JS 'dist'
		// if running separate build commands.
		emptyOutDir: false,

		sourcemap: true,
		minify: true,

		// ==========================================
		// 🎨 CSS PROCESSING
		// ==========================================
		rollupOptions: {
			input: "src/ui/styles.scss",
			output: {
				// Fixes the output path for generated assets
				assetFileNames: () => "ui/styles.css",
			},
		},
	},
});
