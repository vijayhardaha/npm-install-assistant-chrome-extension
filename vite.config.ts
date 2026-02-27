import react from "@vitejs/plugin-react";
import type { PreRenderedChunk } from "rollup";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
	plugins: [
		react(),
		viteStaticCopy({
			targets: [
				{ src: "src/manifest.json", dest: "." },
				{ src: "src/assets/*", dest: "assets" },
			],
		}),
	],
	build: {
		outDir: "dist",
		emptyOutDir: true,
		sourcemap: true,
		minify: true,
		cssCodeSplit: true,
		rollupOptions: {
			input: { content: "src/content/index.tsx" },
			output: {
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
