# Contributing

Thanks for contributing to NPM Install Assistant.

## Prerequisites

- Node.js 22 (see .nvmrc)
- pnpm 10 (see scripts in package.json)

## Setup

```sh
pnpm install
```

## Development

```sh
pnpm dev
```

- Content script build config: vite.config.ts
- Styles build config: vite.styles.config.ts

## Build

```sh
pnpm build
```

Build output goes to dist/ and includes the manifest and assets from src/manifest.json.

## Tests

```sh
pnpm test
```

Tests use Vitest + React Testing Library (see vitest.config.ts).
Add tests under src/\*\*/**tests**.

## Linting and Formatting

```sh
pnpm lint
pnpm stylelint
pnpm format:check
```

Formatting is enforced by prettier.config.mjs.
ESLint rules are defined in eslint.config.mjs.

## Branching and PRs

- Use feature branches: feature/<short-name>
- Keep PRs small and focused
- Update or add tests when changing logic in src/content/SidebarApp.tsx or src/content/index.tsx

## Releases

Tag a release as v\* to trigger the release workflow in .github/workflows/build.yml.
