/**
 * ======================================================================
 * Prettier Configuration
 * ======================================================================
 * Purpose: Defines code formatting rules to ensure consistent style across the
 * repository. Use `npx prettier --write .` to apply these rules.
 * Docs: https://prettier.io/docs/configuration
 * ======================================================================
 */

/** @type {import("prettier").Config} */
const config = {
	// ---- Layout & Spacing ----
	// Maximum line length before Prettier wraps expressions
	printWidth: 120,
	// Number of spaces per indentation level
	tabWidth: 2,
	// Use spaces instead of tab characters
	useTabs: false,

	// ---- General Syntax ----
	semi: true, // Enforce semicolons at the end of statements
	singleQuote: false, // Prefer single quotes for strings
	endOfLine: "auto", // Respect existing line endings to avoid unnecessary diffs

	// ---- Behavior & Edge Cases ----
	arrowParens: "always", // Include parens around single-arg arrow functions
	trailingComma: "es5", // Add trailing commas where valid in ES5 (objects, arrays)
	bracketSpacing: true, // Print spaces between object braces: { foo: bar }
	bracketSameLine: false, // Put > of multi-line HTML/JSX elements on a new line
	proseWrap: "preserve", // Respect manual wrapping in markdown/ prose
	experimentalOperatorPosition: "start", // Place operators at line start in multiline expressions
	objectWrap: "collapse", // Preserve developer's object wrapping where present

	// ---- Plugins ----
	// plugins: ["prettier-plugin-tailwindcss"],

	// ---- Overrides (Grouped by Language) ----
	overrides: [
		{
			// Backend: Python & PHP (PEP8 / PSR-12)
			files: ["*.py", "*.php"],
			options: { tabWidth: 4, useTabs: false },
		},
		{
			// Scripting: JS/TS
			files: ["*.js", "*.ts", "*.mjs", "*.cjs", "*.jsx", "*.tsx"],
			options: { tabWidth: 2, singleQuote: true },
		},
		{
			// Styles: CSS / SASS
			files: ["*.css", "*.scss", "*.sass"],
			options: { tabWidth: 2 },
		},
		{
			// Data & Docs: JSON / YAML / Markdown
			files: ["*.json", "*.jsonc", "*.yml", "*.yaml", "*.md", "*.mdx"],
			options: {
				tabWidth: 2,
				// JSON does not support trailing commas — disable for these formats
				trailingComma: "none",
			},
		},
	],
};

export default config;
