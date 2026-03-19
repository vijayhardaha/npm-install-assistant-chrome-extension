/**
 * ======================================================================
 * Stylelint Configuration
 * ======================================================================
 * Purpose: Project-wide Stylelint configuration for Next.js with SCSS
 *          support. Enforces consistent CSS/SCSS patterns and maintains
 *          code quality.
 * Docs: https://stylelint.io/user-guide/configure
 * ======================================================================
 */

import type { Config } from 'stylelint';

// ---- Configuration ----
const config: Config = {
  // ---- Extends ----
  // Use standard SCSS rules and SMACSS ordering for consistent styling
  // patterns.
  extends: ['stylelint-config-standard-scss', 'stylelint-config-property-sort-order-smacss'],

  // ---- Plugins ----
  // Add stylelint-order plugin to enforce consistent property ordering.
  plugins: ['stylelint-order'],

  // ---- Rules ----
  // Project-specific overrides to allow flexible naming conventions and
  // handle edge cases in Next.js/SCSS development. Each rule below includes
  // a concise explanation of its effect.
  rules: {
    // --- Naming Conventions ---
    // Allow creative/flexible class and ID naming patterns (e.g., BEM
    // variants).
    'selector-class-pattern': null,
    'selector-id-pattern': null,

    // --- Next.js / SCSS Edge Cases ---
    // Disable rules that are overly strict for modern Next.js development.
    'no-empty-source': null,
    'function-url-quotes': null,
    'no-descending-specificity': null,

    // --- Comment Enforcement ---
    // Allow empty comments for development placeholders and commented-out
    // code.
    'comment-no-empty': null,
    'scss/comment-no-empty': null,
  },
};

export default config;
