/**
 * =====================================================================
 * Eslint Configuration
 * =====================================================================
 * Purpose: Project-wide ESLint configuration for TypeScript, React, and
 *          Chrome Extension content scripts. Enforces code quality and
 *          consistent styling.
 * Docs: https://eslint.org/docs/latest/use/configure/configuration-files-new
 * =====================================================================
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname, recommendedConfig: js.configs.recommended });

export default defineConfig([
  globalIgnores([
    '**/.git/',
    '**/.idea/',
    '**/.vscode/',
    '**/.husky/',
    '**/node_modules/',
    '**/dist/',
    '**/build/',
    '**/assets/',
    '**/coverage/',
    '**/*.log',
    '**/.DS_Store',
    '**/*.tmp',
  ]),

  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended'
  ),

  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true }, tsconfigRootDir: __dirname },
    },

    settings: { react: { version: 'detect' } },

    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'prettier/prettier': 'warn',
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
