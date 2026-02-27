import { defineConfig } from "vite";

export default defineConfig({
	build: {
		outDir: "dist",
		emptyOutDir: false,
		sourcemap: true,
		minify: true,
		rollupOptions: {
			input: "src/ui/styles.scss",
			output: { assetFileNames: () => "ui/styles.css" },
		},
	},
});
