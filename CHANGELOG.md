# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-04-17

### Added

- Subtle grid overlay on game canvas (3% opacity white lines) for visual orientation
- Snake head eyes (two white dots) for better visual identity
- 5 E2E game mechanic tests (canvas rendering, snake/food visibility, direction changes, wall collision, game over overlay)

### Changed

- Snake segments now use rounded corners (roundRect) instead of plain rectangles
- Food rendered as circle instead of square, with smooth pulse animation
- Service worker improved: cache-first for static assets (JS, CSS, images, fonts), network-first for HTML navigation
- README.md version table updated to match actual dependency versions (TS 6.0, Vite 8.0, Biome 2.4, Playwright 1.59)

### Removed

- Deleted orphaned `bun.setup.ts` (bunfig.toml handles test configuration)

### Fixed

- Added `.moai/reports/` to `.gitignore`

## [1.2.0] - 2026-04-17

### Changed

- Updated Biome from 1.9.4 to 2.4.12 (migrated config format)
- Updated Vite from 6.2.3 to 8.0.8
- Updated TypeScript from 5.8 to 6.0
- Updated Playwright from 1.50 to 1.59
- Pinned happy-dom to 17.x (20.x has querySelector bug with Bun)
- Added explicit type="button" to all HTML buttons
- Added bunfig.toml to exclude E2E tests from Bun test runner
- Removed unused ScoreEntry interface from test file
- Fixed unused variable warnings for dev dependency updates
- Version synced from 1.1.0 to 1.2.0

### Added

- PWA manifest and service worker for offline support
- Favicon (inline SVG snake emoji)
- Meta theme-color and Open Graph tags
- Accessibility skip-to-controls link
- Canvas ARIA attributes (role, aria-label, tabindex)
- Comprehensive E2E test suite (32 tests covering all workflows)
- Keyboard input tests (Arrow, WASD, Space, Escape, R)
- Responsive layout tests (desktop, tablet, mobile)
- Accessibility tests (ARIA labels, aria-live)
- Game state transition lifecycle tests

### Fixed

- Restart from paused state now works (handleStart guard extended to "paused" state)
- Removed dead CSS for game-over overlay HTML that was removed in v1.1.0
- Removed stale `publicDir: "public"` from vite.config.ts
- Fixed SoundManager `as any` type cast to typed cast
- Added test-results/ and playwright-report/ to .gitignore

### Changed

- package.json version synced to 1.1.0 (was 1.0.0)
- E2E test suite expanded from 6 to 32 tests
- Build output: 20.39 KB JS (6.17 KB gzipped)

## [1.1.0] - 2026-04-17

### Added

- Touch/swipe controls for mobile (tap to start, swipe to change direction)
- Progressive difficulty: speed increases by 2ms per food eaten (150ms to 60ms min)
- Food pulse animation with sinusoidal scaling
- Snake head color differentiation (lighter green)
- Score popup (+10) with fade-out animation

### Fixed

- Unified localStorage key between ScoreBoard and ScoreStorage ("snake_high_score")
- Removed duplicate keyboard handling from GameControls (now in main.ts only)
- Removed unused game-over overlay HTML from index.html
- Removed redundant direction queue processing in Snake.update()
- Cleaned up stale files (empty public/, .bun-do-not-test/)
- Fixed biome config to properly ignore infrastructure directories

### Changed

- README.md updated to reflect current project structure
- PROJECT_HANDOFF.md updated with current session state

## [1.0.2] - 2026-03-03

### Changed

- Removed unused `Game.ts` class with empty render methods
- Optimized food position generation with rejection sampling
- Deduplicated direction logic - exported from Snake.ts

### Removed

- `src/game/Game.ts` - unused class
- `tests/unit/Game.test.ts` - orphaned test file

## [1.0.1] - 2026-03-03

### Fixed

- Fixed ScoreBoard API mismatch: `setScore()` to `updateScore()` in main.ts
- Fixed ScoreStorage API mismatch: `saveHighScore()` to `saveScore()` in main.ts
- Added AudioContext resume for suspended state in SoundManager
- Added localStorage error handling in ScoreBoard

## [1.0.0] - 2026-02-25

### Added

- Core game engine with 60 FPS game loop
- Snake entity with movement, growth, and collision detection
- Food system with random placement
- Canvas 2D rendering
- ScoreBoard, GameControls, SoundControls UI components
- SoundManager with procedural audio
- ScoreStorage with localStorage persistence
- Responsive CSS with mobile-first design
- 151 unit tests (87.36% coverage)
- 6 Playwright E2E tests

[1.1.0]: https://github.com/jungukhur/snake-game/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/jungukhur/snake-game/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/jungukhur/snake-game/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/jungukhur/snake-game/releases/tag/v1.0.0
