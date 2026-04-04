# NPM Install Assistant

Chrome extension that enhances npm package pages with an install-helper sidebar. Provides version selection, package manager choice (`npm`/`yarn`/`pnpm`), dependency type toggle, and one-click copy functionality.

## Tech Stack

React 19 · TypeScript (strict, verbatimModuleSyntax) · Bun · Vite (ES output) · Sass (component partials) · Vitest + RTL + jsdom

## Project Structure

```
src/content/index.tsx        # Content script entry point
src/content/SidebarApp.tsx   # React UI component
src/ui/styles.scss           # Main stylesheet (imports partials)
src/ui/components/           # SCSS partials (_card, _command, _controls, _copy, _hint)
src/ui/_variables.scss       # SCSS variables
src/ui/_mixins.scss          # SCSS mixins
src/manifest.json            # Extension manifest (outputs to dist/)
dist/                        # Build output (js/, ui/, assets/)
assets/                      # Static icons (edit only if requested)
```

## Commands

```bash
bun run dev              # Start watch mode
bun run build            # Production build
bun run lint             # ESLint check
bun run lint:fix         # ESLint auto-fix
bun run format           # Prettier format
bun run format:check     # Prettier check
bun run stylelint        # SCSS linting
bun run stylelint:fix    # SCSS auto-fix
bun run tsc              # Type check
bun run test             # Run tests
bun run test:watch       # Test watch mode
bun run test:coverage    # Coverage report
```

## Code Standards

### Naming Conventions

- Components: `PascalCase`
- Functions/variables: `camelCase`
- Files: `kebab-case`
- Constants: `SCREAMING_SNAKE_CASE`

### TypeScript Rules

- Use `interface` for object shapes, `type` for unions
- Avoid `any` (use `unknown` instead)
- Avoid non-null assertion `!` (use `?.` or explicit checks)

### Import Order

External packages first (React, then others), then internal modules. Use `import type` for type-only imports.

### Formatting

Follow `prettier.config.mjs`. Rules: no semicolons, double quotes, trailing commas (es5), arrow function parens always.

### Required Pre-commit Checks

1. Remove unused `React` imports (React 19 JSX transform)
2. Run `bun run lint && bun run tsc`
3. Prefix intentionally unused variables with `_`
4. Add JSDoc for all exported functions

## Testing

- Location: `src/**/__tests__`
- Use `data-testid` attributes for DOM queries
- Setup file: `vitest.setup.ts`

## Documentation

- Add JSDoc comments for exported functions and complex types only

## Git Workflow

Pre-commit hooks automatically run type check, lint, and format checks.

**After completing a task:**

1. Check unstaged changes: `git status --porcelain`
2. Stage files: `git add <files>`
3. Create `.tmp/git.md` containing the staged files and commit command

Example `.tmp/git.md`:

```bash
git add src/content/index.tsx
git commit -m "feat: add version dropdown selector

- fetch versions from npm registry
- render dropdown with recent versions"
```

## Commit Conventions

**Format:** `<type>(<scope>): <summary>`

**Types:** `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `build`, `chore`

**Rules:** Subject line ≤50 chars, blank line after subject, body wrapped at 72 chars, lowercase only.
