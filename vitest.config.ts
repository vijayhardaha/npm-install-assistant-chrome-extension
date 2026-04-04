/**
 * ========================================================================
 * Vitest Configuration
 * ========================================================================
 * Purpose: Configure Vitest for unit and integration tests (jsdom env)
 * Docs: https://vitest.dev/config/
 * ========================================================================
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // ---- Environment ----
    // Use JSDOM so React components can be mounted in tests. This
    // provides a browser-like DOM API for rendering and assertions.
    environment: 'jsdom',

    // ---- Setup & Globals ----
    // Setup file executed before running tests (e.g., matchers, globals)
    setupFiles: ['vitest.setup.ts'],

    // ---- Globals ----
    // Allow global test helpers like `describe`, `it`, `expect` for
    // convenience in test files.
    globals: true,

    // Limit discovery to test and spec files written in TS/TSX.
    include: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],

    // ---- Coverage & Output ----
    // Coverage configuration: include source files, exclude test helpers
    coverage: {
      // Use V8 native instrumentation for fast coverage collection.
      provider: 'v8',

      // Generate terminal, machine-readable, and browsable reports.
      reporter: ['text', 'json', 'html'],

      // Write generated coverage artifacts into the project coverage folder.
      reportsDirectory: './coverage',

      // Exclude setup, generated, build, and non-target files from coverage.
      exclude: [
        'node_modules/',
        'vitest.config.ts',
        'vitest.setup.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/dist/',
        '**/build/',
      ],
    },
  },
});
