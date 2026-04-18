# Snake Game

A classic snake game built with TypeScript, featuring responsive design, sound effects, touch controls, and local score persistence.

## Features

- **Classic Snake Gameplay**: Navigate the snake to eat food and grow longer
- **Progressive Difficulty**: Speed increases as you score more points
- **Touch Controls**: Swipe to change direction on mobile devices
- **Score System**: Track current score and high score with persistent storage
- **Sound Effects**: Procedurally generated audio using Web Audio API
- **Responsive Design**: Mobile-first layout that works on all screen sizes
- **Visual Polish**: Pulsing food, differentiated snake head, score popups
- **Keyboard Controls**: Arrow keys/WASD for direction, Space for pause, R for restart

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| TypeScript | 5.8+ | Type-safe development |
| Bun | 1.3+ | Runtime, package manager, test runner |
| Vite | 6.2+ | Build tool and dev server |
| Biome | 1.9+ | Linting and formatting |
| Playwright | 1.50+ | E2E testing |

## Installation

```bash
bun install
```

## Development

```bash
bun run dev          # Start dev server
bun test             # Run unit tests
bun run test:e2e     # Run E2E tests
bun run lint         # Lint code
bun run lint:fix     # Fix lint issues
bun run build        # Production build
bun run preview      # Preview production build
```

## Game Controls

| Input | Action |
|-------|--------|
| Arrow Keys / WASD | Change direction |
| Swipe (mobile) | Change direction |
| Tap canvas (mobile) | Start / Restart |
| Space | Pause / Resume |
| R | Restart |
| Esc | Return to menu |

## Project Structure

```
snake-game/
├── src/
│   ├── game/               # Core game engine
│   │   ├── Snake.ts         # Snake entity with direction queue
│   │   ├── Food.ts          # Food system with rejection sampling
│   │   └── Renderer.ts      # Canvas 2D rendering with visual effects
│   ├── audio/
│   │   └── SoundManager.ts  # Procedural sound via Web Audio API
│   ├── storage/
│   │   └── ScoreStorage.ts  # Score persistence with memory fallback
│   ├── ui/
│   │   ├── ScoreBoard.ts    # Score display component
│   │   ├── GameControls.ts  # Game button controls
│   │   └── SoundControls.ts # Volume/mute controls
│   ├── main.ts              # Entry point and game loop
│   └── styles.css           # Responsive styles
├── tests/
│   ├── unit/                # Unit tests (Bun Test)
│   └── e2e/                 # E2E tests (Playwright)
└── dist/                    # Production build output
```

## Quality Metrics

- **Tests**: 133 passing
- **Lint**: Zero errors (Biome)
- **Build**: 20.3 KB JS (6.1 KB gzipped)

## Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## License

MIT

## Author

Junguk Hur
