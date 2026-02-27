/**
 * ###############################################################################
 * _____                _     _   _               _____             _
 * |  __ \              | |   | | | |             / ____|           / ____(_)
 * | |__) | __ ___  ___ | |_  | |_| |_ ___ _ __ | |     ___  _ __ | |     _  __ _
 * |  ___/ '__/ _ \/ _ \| __| | __| __/ _ \ '__|| |    / _ \| '_ \| |_   | |/ _` |
 * | |   | | |  __/  __/ |_  | |_| ||  __/ |   | |___| (_) | | | | |____| | (_| |
 * |_|   |_|  \___|\___|\__|  \__|\__\___|_|    \_____\___/|_| |_|\_____|_|\__, |
 * __/ |
 * PRETTIER CODE ARCHITECT (CJS)                                           |___/
 * ###############################################################################
 *
 * PURPOSE:
 * CommonJS version for maximum compatibility with legacy Node.js environments
 * and specific build tools that do not yet support ESM.
 *
 * ###############################################################################
 */

/** @type {import("prettier").Config} */
const config = {
	// --- Layout & Spacing ---
	printWidth: 100,      // Max line length before wrapping
	tabWidth: 4,          // Visual width of a tab
	useTabs: true,        // Use actual tabs

	// --- General Syntax ---
	semi: true,           // Always use semicolons
	singleQuote: false,   // Double quotes (standard for HTML/React props)
	endOfLine: "auto",    // Maintains existing line endings

	// --- Logic & Functions ---
	arrowParens: "always",						// (x) => {} instead of x => {}
	trailingComma: "es5",						// Commas where valid in ES5
	bracketSpacing: true,						// { foo: bar }
	bracketSameLine: false,						// Puts > on a new line
	proseWrap: "preserve",						// Respect manual line breaks
	experimentalOperatorPosition: "start",	// Align operators in multiline expressions
	objectWrap: "collapse",						// Preserve existing wrapping of objects

	// --- Plugins ---
	// Note: In CJS, some plugins must be required if not auto-loaded
	// plugins: ["prettier-plugin-tailwindcss"],

	overrides: [
		{
			// --- Override for JSON files to disable trailing commas ---
			files: ["*.json", "*.jsonc"],
			options: {
				trailingComma: "none",
			},
		},
	],
};

export default config;
