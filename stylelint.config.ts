import type { Config } from "stylelint";

const config: Config = {
	extends: [
		"stylelint-config-standard-scss",
		"stylelint-config-property-sort-order-smacss",
	],
	plugins: ["stylelint-order"],
	rules: {
		"no-empty-source": null,
		"function-url-quotes": null,
		"no-descending-specificity": null,
		"selector-class-pattern": null,
		"selector-id-pattern": null,
		"comment-no-empty": null,
		"scss/comment-no-empty": null,
	},
};

export default config;
