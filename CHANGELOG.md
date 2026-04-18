# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
