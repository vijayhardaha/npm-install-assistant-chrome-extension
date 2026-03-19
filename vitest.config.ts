/**
 * ========================================================================
 * Vitest Configuration
 * ========================================================================
 * Purpose: Configure Vitest for unit and integration tests (jsdom env)
 * Docs: https://vitest.dev/config/
 * ========================================================================
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// ---- Environment ----
		// Use JSDOM so React components can be mounted in tests. This
		// provides a browser-like DOM API for rendering and assertions.
		environment: "jsdom",

		// ---- Setup & Globals ----
		// Setup file executed before running tests (e.g., matchers, globals)
		setupFiles: ["./src/test/setup.ts"],

		// ---- Globals ----
		// Allow global test helpers like `describe`, `it`, `expect` for
		// convenience in test files.
		globals: true,

		// ---- Coverage & Output ----
		// Coverage configuration: include source files, exclude test helpers
		coverage: {
			include: ["src/**/*.{ts,tsx}"],
			exclude: ["src/test/**", "**/node_modules/**"],
		},
	},
});
