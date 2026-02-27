/**
 * ###############################################################################
 * ______  _____  _      _____ _   _ _______
 * |  ____|/ ____|| |    |_   _| \ | |__   __|
 * | |__  | (___  | |      | | |  \| |  | |
 * |  __|  \___ \ | |      | | | . ` |  | |
 * | |____ ____) || |____ _| |_| |\  |  | |
 * |______|_____/ |______|_____|_| \_|  |_|
 *
 * THE LOGIC GUARDIAN (Flat Config)
 * ###############################################################################
 * PURPOSE:
 * Enforces strict coding standards, catches logical errors, and ensures
 * React/TypeScript best practices are followed across the codebase.
 * ###############################################################################
 */

import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintPluginPrettier from "eslint-plugin-prettier/flat";

export default tseslint.defineConfig(
	// --- Base Recommended Configs ---
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,

	{
		// ==========================================
		// 📂 TARGETS & EXCLUSIONS
		// ==========================================
		files: ["src/**/*.{ts,tsx}", "gulpfile.mjs"],
		ignores: ["node_modules", "dist", "assets"],

		// ==========================================
		// ⚙️ ENVIRONMENT & PARSING
		// ==========================================
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				...globals.browser,
				...globals.node, // Added Node for gulpfile/config support
			},
		},

		// ==========================================
		// 🔌 PLUGINS & SETTINGS
		// ==========================================
		plugins: {
			react: reactPlugin,
			"react-hooks": reactHooksPlugin,
			prettier: eslintPluginPrettier,
		},
		settings: {
			react: {
				version: "detect", // Auto-detect React version for rules
			},
		},

		// ==========================================
		// 🛡️ RULES & ENFORCEMENT
		// ==========================================
		rules: {
			// --- React Specific ---
			"react/react-in-jsx-scope": "off", // Not needed in React 17+
			"react/jsx-uses-react": "off",     // Not needed in React 17+
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "warn",

			// --- Prettier Integration ---
			"prettier/prettier": "error", // Treat formatting issues as errors
		},
	},

	// --- Prettier Conflict Resolution ---
	// Must be the last item to override other rules
	eslintConfigPrettier
);
