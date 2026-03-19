/**
 * =====================================================================
 * Eslint Configuration (Flat)
 * =====================================================================
 * Purpose: Project-wide ESLint configuration for Next.js, TypeScript, and
 *          React. Enforces code quality, accessibility, and consistent styling.
 * Docs: https://eslint.org/docs/latest/use/configure/configuration-files-new
 * Usage: npx eslint .
 * =====================================================================
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

// ---- Context setup ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname, recommendedConfig: js.configs.recommended });

export default defineConfig([
  // ---- Global ignores ----
  // Files and folders that should never be linted
  globalIgnores([
    // Version Control & IDEs
    '**/.git/',
    '**/.idea/',
    '**/.vscode/',
    '**/.husky/',

    // Dependencies
    '**/node_modules/',

    // Build Outputs & Cache
    '**/dist/',
    '**/build/',
    '**/out/',
    '**/*.tsbuildinfo',

    // Testing & Coverage
    '**/coverage/',
    '**/test-results/',

    // Static Assets & Configs
    '**/public/',
    '**/.env*',

    // Logs & System Files
    '**/*.log',
    '**/.DS_Store',
    '**/Thumbs.db',

    // Temporary/Backup Files
    '**/*.tmp',
  ]),

  // ---- Base extends & plugins ----
  // Extend React, TypeScript and Prettier recommended configs.
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended'
  ),

  {
    // ---- Target files ----
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],

    // ---- Language & parser options ----
    // Short, in-line explanations are provided for each key so developers
    // understand what changes in lint behavior to expect when altering
    // these values.
    languageOptions: {
      // Enables parsing of modern JavaScript syntax features used across
      // the codebase (optional chaining, nullish coalescing, private class
      // fields, top-level await).
      ecmaVersion: 'latest',
       // Use ECMAScript modules so the parser accepts `import`/`export` syntax
      // and ESLint treats files as module scope (affects hoisting and globals).
      sourceType: 'module',
      // Provide common runtime globals from both browser and Node.js so
      // references like `window`, `fetch`, or `process` do not raise undefined
      // errors.
      globals: { ...globals.browser, ...globals.node },
       // Use the TypeScript parser to support .ts/.tsx syntax and enable
      // @typescript-eslint based rules and type-aware linting when configured.
      parser: tsParser,
      // Enable JSX parsing and point parser at the project's tsconfig so
      // parser/semantic features (when available) resolve correctly.
      parserOptions: { ecmaFeatures: { jsx: true }, tsconfigRootDir: __dirname },
    },

    // ---- Shared settings ----
    // Let plugins automatically detect framework/runtime specifics
    settings: { react: { version: 'detect' } },

     // ---- Custom rules ----
    // Purpose: Project-specific overrides to enforce import order, TypeScript
    // hygiene, Prettier integration and React best-practices. Below each
    // rule or option includes a concise comment explaining its effect.
    rules: {
      // --- React Specific ---
      // Solves 'React' must be in scope when using JSX error in Next.js 12+
      // where React import is not required.
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'prettier/prettier': 'warn',
      // --- Prettier Integration ---

      // --- TypeScript Quality Control ---
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          caughtErrors: 'all',
        },
      ],
    },
  },
]);
