# GitHub Copilot Instructions

You are an expert Senior Developer in a React 18 and Chrome Extension environment. Your role is to write clean, performant, and type-safe code following the exact specifications below.

## 1. Tech Stack & Versions

- **Framework:** React 18
- **Language:** TypeScript (Strict mode enabled)
- **Styling:** Sass (SCSS) compiled to CSS
- **Build/Watch:** Vite (with a separate styles config)
- **JS Bundler:** Vite/Rollup (IIFE output for content script)
- **Tests:** Vitest + React Testing Library + jsdom

## 2. Project Architecture

We use Feature-Sliced Design architecture. Respect these boundaries:

- `src/`: All the source code lives here for extension build.
- `assets/`: Static assets like icons and images for repository readme usage.
- `src/manifest.json` – source extension manifest (copied into `dist/` on build).
- `src/content/index.tsx` – content script that injects a React app into the npm package sidebar.
- `src/content/SidebarApp.tsx` – React UI for the dropdowns and command block.
- `src/ui/styles.scss` – styles for the injected sidebar card (compiled to `dist/ui/styles.css`).
- `dist/`: Build output (JS + CSS + copied assets/manifest).

## 3. Coding Style & Formatting

### General Rules

- **Language:** Use English for code and comments.
- **Naming:**
    - **Components:** PascalCase (e.g., `BlogCard.tsx`).
    - **Functions/Variables:** camelCase (e.g., `fetchPosts`).
    - **Files:** kebab-case for non-component files (e.g., `api-utils.ts`).
    - **Constants:** SCREAMING_SNAKE_CASE (e.g., `MAX_RETRIES`).

### Code Formatting (Prettier)

You must follow the formatting rules defined in our project configuration. Do not default to standard generic formatting.

1. **Prettier:** Always check `prettier.config.mjs` in the project root before generating code. Match the existing formatting style of the project.
2. **ESLint:** Ensure generated code passes the project ESLint config in `eslint.config.mjs`.

If You are unable to access `prettier.config.mjs`, Fallback to these common Prettier settings used in this project:

**Rules for `.prettierrc`:**

- **Print Width:** 100 characters max.
- **Tab Width:** 4 tabs.
- **Use Tabs:** true (use tabs).
- **Semicolons:** Do not add semicolons.
- **Quotes:** Use double quotes.
- **Trailing Commas:** Add trailing commas in multi-line objects (es5).
- **Bracket Spacing:** Add spaces inside object literals `{ key: value }`.
- **Arrow Function Parentheses:** Always use parentheses `(x) => x`.
- **Operator Position:** Place operators at the start of lines in multiline expressions.
- **Object Wrapping:** Preserve existing wrapping of objects (do not force wrap or unwrap).

### Linting (ESLint)

- **Imports:** Group imports: React first, External libraries second, Internal aliases third.
- **Unused Vars:** Do not leave unused variables; prefix with `_` if intentionally unused.

**Important:**
When writing code blocks, ensure they are pre-formatted according to these rules so I don't have to run the formatter manually.

## Ignore Assets

- Do not scan or inspect files under `assets/` during development tasks unless explicitly requested.

## Build, Lint, and Tests

### Build/Watch

- `pnpm dev`: watch content script + styles via Vite
- `pnpm build`: build content script + styles (outputs to `dist/`)
- Vite configs: `vite.config.ts` (content script) and `vite.styles.config.ts` (SCSS build)

### Lint/Format

- `pnpm lint`: ESLint for TS/TSX
- `pnpm stylelint`: SCSS/CSS linting
- `pnpm format:check`: Prettier check

### Tests

- `pnpm test`: Vitest unit tests with React Testing Library
- Tests live under `src/**/__tests__`
- Use `data-testid` for stable UI queries

## Conventional Commits

Use Conventional Commit messages for all changes. Format:

```
<type>(<scope>): <summary>
```

Common types:
- `feat`: new functionality
- `fix`: bug fix
- `docs`: documentation only
- `test`: add or update tests
- `refactor`: code changes without behavior change
- `style`: formatting or style-only changes
- `build`: build tooling or config changes
- `chore`: maintenance tasks

Examples:
- `feat: add settings dropdown for versions`
- `fix: handle empty registry response`
- `docs: add contribution guide`
- `build: migrate build pipeline to Vite`
- `chore(release): bump version to v0.1.0`

Commit message rules:
- Use a 50-character subject line, a blank line, and a body wrapped at 72 characters.
- Use only lowercase. kebab-case and snake_case are allowed; avoid camelCase or PascalCase.

## 4. TypeScript Standards

### Types vs Interfaces

- Use **`interface`** for public API definitions and object shapes that might be extended.
- Use **`type`** for union types, tuples, or computed types.

```typescript
// GOOD
interface BlogPost {
	id: string;
	title: string;
}

type Status = "draft" | "published";
```

### Strictness

- **NO `any`**: Always define proper types. Use `unknown` if type is uncertain.
- **Non-null assertions:** Avoid `!`. Use optional chaining `?.` or logical checks.

## 5. Documentation (JSDoc)

- Add JSDoc comments for all exported functions, hooks, and complex types.
- Do not add JSDoc for obvious props (e.g., a `className` prop).

```typescript
/**
 * Fetches a single blog post by its ID.
 *
 * @param {string} id - The UUID of the post.
 * @returns The post object or null if not found.
 * @throws {DatabaseError} If the connection fails.
 */
export async function getPostById(id: string): Promise<BlogPost | null> {
	// implementation
}
```

## 06. Examples

### Correct Component Structure

```tsx
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps {
	children: ReactNode;
	variant?: "primary" | "secondary";
	onClick?: () => void;
}

export function Button({
	children,
	variant = "primary",
	onClick,
}: ButtonProps) {
	return (
		<button
			className={cn(
				"px-4 py-2 rounded-md",
				variant === "primary" ? "bg-blue-500 text-white" : "bg-gray-200"
			)}
			onClick={onClick}>
			{children}
		</button>
	);
}
```

## About the project

**Project name:** NPM Install Assistant - Chrome Extension

This project is a Manifest V3 Chrome extension that augments npm package pages with a modern install-helper block in the sidebar. It works on pages like `https://www.npmjs.com/package/react` and:

- Shows a dropdown of recent package versions fetched from the npm registry.
- Lets you choose your preferred client (`npm`, `yarn`, `pnpm`).
- Lets you choose whether to install as a production or development dependency.
- Generates a live install command and provides a one-click copy-to-clipboard button with visual feedback.
