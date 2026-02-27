/** @type {import("prettier").Config} */
const config = {
  semi: true,
  singleQuote: false,
  arrowParens: "always",
  useTabs: true,
  tabWidth: 4,
  bracketSpacing: true,
  bracketSameLine: true,
  proseWrap: "preserve",
  experimentalOperatorPosition: "start",
  objectWrap: "collapse",
  trailingComma: "es5",
  overrides: [
    {
      files: "*.json",
      options: {
        trailingComma: "none"
      }
    }
  ]
};

export default config;

