# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2026-03-03

### Changed

#### Code Quality Improvements (SPEC-CLEANUP-001)
- Removed unused `Game.ts` class with empty render methods
- Optimized food position generation with rejection sampling (was creating 900-element array on every call)
- Deduplicated direction logic - now exported from Snake.ts instead of duplicated in main.ts

### Removed
- `src/game/Game.ts` - unused class
- `tests/unit/Game.test.ts` - orphaned test file

## [1.0.1] - 2026-03-03

### Fixed

#### Bug Fixes from Code Review (SPEC-FIX-001)
- Fixed ScoreBoard API mismatch: `setScore()` → `updateScore()` in main.ts
- Fixed ScoreStorage API mismatch: `saveHighScore()` → `saveScore()` in main.ts
- Added AudioContext resume for suspended state in SoundManager (browser autoplay policy)
- Added localStorage error handling in ScoreBoard for private browsing compatibility
- Applied Biome formatting fixes to main.ts

## [1.0.0] - 2026-02-25

### Added

#### Core Game Engine (SPEC-GAME-001)
- Game state machine with Menu, Playing, Paused, and GameOver states
- 60 FPS game loop using requestAnimationFrame with delta time calculation
- Snake entity with movement, growth, and collision detection
- Food system with random placement avoiding snake body
- Canvas 2D rendering with integer coordinates
- Direction queue to prevent 180-degree turns
- Automatic pause on tab visibility change

#### Presentation Layer (SPEC-GAME-002)
- ScoreBoard component displaying current score and high score
- GameControls component with Start, Pause, and Restart buttons
- SoundControls component with volume slider and mute toggle
- Responsive CSS with mobile-first design
- Keyboard shortcuts (Space, R, Esc)
- ARIA labels for accessibility

#### Infrastructure Layer (SPEC-GAME-003)
- SoundManager using Web Audio API with procedural sound generation
- ScoreStorage with localStorage abstraction and memory fallback
- Volume control and mute toggle for audio
- High score tracking with timestamps
- Graceful degradation for unsupported browsers

#### Testing & Quality
- 151 unit tests using Bun Test
- 87.36% test coverage
- Biome linting with zero errors
- Production build (16.7 KB, 4.9 KB gzipped)

[1.0.0]: https://github.com/jungukhur/snake-game/releases/tag/v1.0.0
