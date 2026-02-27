# Project Guide

## Overview

NPM Install Assistant is a Manifest V3 Chrome extension that injects a React UI
into npm package pages to generate install commands. The content script mounts
the UI into the npm sidebar and the UI fetches package versions from the npm
registry.

## Key Files

- Extension manifest: src/manifest.json
- Content entry: src/content/index.tsx
- Main UI: src/content/SidebarApp.tsx
- Styles: src/ui/styles.scss

## Build Output

- JS bundle (IIFE): dist/js/content.iife.js
- Styles: dist/ui/styles.css
- Copied assets and manifest from src/

Build is configured in vite.config.ts and vite.styles.config.ts.

## Scripts

See package.json for:

- pnpm dev (watch builds)
- pnpm build
- pnpm test
- pnpm lint
- pnpm stylelint
- pnpm format:check

## Testing

Unit tests live under src/\*\*/**tests** and run with Vitest + RTL.
Test config: vitest.config.ts.

## CI

The build and release workflow is in .github/workflows/build.yml.
Tag with v\* to publish a release artifact.
