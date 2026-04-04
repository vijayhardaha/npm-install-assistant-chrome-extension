# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - Apr 04, 2026

### Added

- React Error Boundary to prevent extension crashes
- Utils module with testable pure functions
- Sidecar module to isolate mounting logic (no exports in content script per Chrome extension best practices)
- Debounced MutationObserver to reduce unnecessary mounts
- useCallback for handleCopy to optimize renders
- JSDoc comments for constants
- Unit tests for pathname parsing
- Proper cleanup of copy timeout on unmount
- Additional ARIA attributes (aria-hidden on overlay, aria-labelledby on dropdown)

### Changed

- Improved version sorting to correctly handle pre-release versions (semver)
- Normalized package names to lowercase for consistency
- Refactored SidebarApp structure with better state management
- Improved accessibility across components

### Fixed

- Fixed aria-label typo on package manager select
- Removed unused variables
- Fixed copy button timeout cleanup to prevent memory leaks
- Manifest now includes `"type": "module"` for ES module support

### Development

- Split GitHub workflows into separate ci.yml and build.yml
- Added paths filtering to CI to avoid unnecessary runs
- Removed vite-plugin-static-copy in favor of Vite's built-in public directory
- Moved static assets (manifest.json, icons) to public/
- Updated build configuration for cleaner asset handling
- All tests, lint, typecheck, and stylelint pass

## [0.0.2] - Mar 19, 2026

### Added

- Basic version selection with beta/pre-release toggle
- Settings panel for customizing max versions shown
- LocalStorage persistence for user preferences
- Clipboard copy with fallback for older browsers
- Comprehensive test suite with Vitest and React Testing Library

### Changed

- Improved UI styling with SCSS components
- Better error handling for registry fetch failures

### Fixed

- Various bug fixes and performance improvements

## [0.0.1] - Feb 27, 2026

### Added

- Initial release
- Basic install command generation for npm, yarn, pnpm, and bun
- Version dropdown populated from npm registry
- Dependency type toggle (production/development)
- Simple UI integrated into npmjs.com package sidebar
