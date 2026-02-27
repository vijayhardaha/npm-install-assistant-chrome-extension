/**
 * ###############################################################################
 * __      _______ _______ ______  _____ _______
 * \ \    / /_   _|__   __|  ____|/ ____|__   __|
 * \ \  / /  | |    | |  | |__  | (___    | |
 * \ \/ /   | |    | |  |  __|  \___ \   | |
 * \  /   _| |_   | |  | |____ ____) |  | |
 * \/   |_____|  |_|  |______|_____/   |_|
 *
 * THE TRUTH SEEKER (Vitest)
 * ###############################################################################
 * PURPOSE:
 * Configures the unit and integration testing runner. Uses JSDOM to
 * simulate a browser environment for React component testing.
 * ###############################################################################
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// ==========================================
		// 🌐 ENVIRONMENT
		// ==========================================
		// Simulates a browser environment (DOM) for React components
		environment: "jsdom",

		// ==========================================
		// ⚙️ SETUP & GLOBALS
		// ==========================================
		// Path to the file that runs before each test (e.g., jest-dom matchers)
		setupFiles: ["./src/test/setup.ts"],

		// Allows use of 'describe', 'it', 'expect' without manual imports
		globals: true,

		// ==========================================
		// 🔍 COVERAGE & OUTPUT
		// ==========================================
		// Optional: Define which files to include in coverage reports
		coverage: {
			include: ["src/**/*.{ts,tsx}"],
			exclude: ["src/test/**", "**/node_modules/**"],
		},
	},
});
