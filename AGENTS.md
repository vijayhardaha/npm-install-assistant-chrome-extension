# Agent Instructions

You are an expert Senior Developer working on a Chrome Extension project. Follow these instructions for all tasks.

## Tech Stack

- **Framework:** React 19
- **Language:** TypeScript (Strict mode, verbatimModuleSyntax enabled)
- **Package Manager:** Bun
- **Styling:** Sass (SCSS) compiled to CSS
- **Build:** Vite
- **Tests:** Vitest + React Testing Library + jsdom

## Project Structure

```
npm-install-assistant/
├── src/
│   ├── content/
│   │   ├── index.tsx          # Content script entry
│   │   ├── SidebarApp.tsx    # React UI component
│   │   └── __tests__/         # Test files
│   ├── ui/
│   │   └── styles.scss        # SCSS styles
│   ├── test/
│   │   └── setup.ts           # Test setup
│   └── manifest.json          # Extension manifest
├── dist/                       # Build output
├── vite.config.ts             # Vite build config
├── tsconfig.json              # TypeScript config
├── eslint.config.mjs          # ESLint config
├── prettier.config.mjs        # Prettier config
└── stylelint.config.ts        # Stylelint config
```

## Commands

```bash
# Development
bun run dev          # Watch mode
bun run build        # Production build

# Code Quality
bun run lint         # ESLint
bun run lint:fix     # ESLint with auto-fix
bun run format       # Format with Prettier
bun run format:check # Check formatting
bun run stylelint    # SCSS linting
bun run tsc          # TypeScript check

# Testing
bun run test         # Run tests
bun run test:watch   # Watch mode

# Full pipeline
bun run pack:ext     # Lint + format + stylelint + build + test + pack
```

## TypeScript Settings

- `verbatimModuleSyntax: true` - Use `import type` for type-only imports
- `module: "Preserve"` - Keep ESM syntax as-is
- `moduleDetection: "force"` - Auto-detect ESM vs CJS
- `strict: true` - Full strict type checking

## Code Style

- **Print Width:** 100 characters
- **Tabs:** 4 spaces
- **Quotes:** Double quotes
- **Semicolons:** No
- **Trailing Commas:** es5 style
- **Arrow Functions:** Always use parentheses `(x) => x`

## ESLint Config

Uses Flat Config with:

- `@typescript-eslint` for TypeScript
- `eslint-plugin-react`
- `eslint-plugin-react-hooks`
- `eslint-plugin-prettier`

## Conventional Commits

```
<type>(<scope>): <summary>

Types: feat, fix, docs, test, refactor, style, build, chore
```

## Important Rules

1. Remove unused `React` imports (React 19 JSX transform doesn't require it)
2. Use `import type` for type-only imports when `verbatimModuleSyntax` is enabled
3. Run `bun run lint` and `bun run tsc` before committing
4. Write JSDoc for exported functions and complex types
5. Use `interface` for object shapes, `type` for unions/tuples
