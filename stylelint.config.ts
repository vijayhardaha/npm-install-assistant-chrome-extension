/**
 * ###############################################################################
 * _____ _______ __     __ _      ______ _      _____ _   _ _______
 * / ____|__   __|\ \   / /| |    |  ____| |    |_   _| \ | |__   __|
 * | (___    | |    \ \_/ / | |    | |__  | |      | | |  \| |  | |
 * \___ \   | |     \   /  | |    |  __| | |      | | | . ` |  | |
 * ____) |  | |      | |   | |____| |____| |____ _| |_| |\  |  | |
 * |_____/   |_|      |_|   |______|______|______|_____|_| \_|  |_|
 *
 * THE STYLE GUARDIAN (TypeScript)
 * ###############################################################################
 * PURPOSE:
 * Maintains visual consistency and CSS architectural standards. Focuses on
 * SCSS best practices and logical property ordering (SMACSS).
 * ###############################################################################
 */

import type { Config } from "stylelint";

const config: Config = {
	// --- Ruleset Inheritance ---
	extends: [
		"stylelint-config-standard-scss",           // Standard SCSS rules
		"stylelint-config-property-sort-order-smacss", // Logical SMACSS ordering
	],

	// --- Plugins ---
	plugins: ["stylelint-order"],

	// --- Rule Customization ---
	rules: {
		// Disable restrictive patterns to allow for creative/flexible naming
		"selector-class-pattern": null,
		"selector-id-pattern": null,

		// Handle specific edge cases in Next.js/SCSS development
		"no-empty-source": null,
		"function-url-quotes": null,
		"no-descending-specificity": null,

		// Clean up comment enforcement
		"comment-no-empty": null,
		"scss/comment-no-empty": null,
	},
};

export default config;
