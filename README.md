# Snake Game

A classic snake game built with TypeScript, featuring responsive design, sound effects, and local score persistence.

## Features

- **Classic Snake Gameplay**: Navigate the snake to eat food and grow longer
- **Score System**: Track current score and high score with persistent storage
- **Sound Effects**: Procedurally generated audio using Web Audio API
- **Responsive Design**: Mobile-first layout that works on all screen sizes
- **Keyboard Controls**: Arrow keys for direction, Space for pause, R for restart, Esc for menu
- **Accessibility**: ARIA labels and keyboard navigation support

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
# Install dependencies
bun install
```

## Development

```bash
# Start dev server
bun run dev

# Run tests
bun test

# Run E2E tests
bun run test:e2e

# Lint code
bun run lint

# Fix lint issues
bun run lint:fix
```

## Build

```bash
# Create production bundle
bun run build

# Preview production build
bun run preview
```

## Game Controls

| Key | Action |
|-----|--------|
| Arrow Keys | Change direction |
| Space | Pause/Resume |
| R | Restart game |
| Esc | Return to menu |

## Project Structure

```
snake-game/
├── public/
│   └── index.html          # Main HTML file
├── src/
│   ├── game/               # Core game engine
│   │   ├── Game.ts         # Game state machine and loop
│   │   ├── Snake.ts        # Snake entity
│   │   ├── Food.ts         # Food system
│   │   └── Renderer.ts     # Canvas 2D rendering
│   ├── audio/              # Audio system
│   │   └── SoundManager.ts # Sound playback
│   ├── storage/            # Persistence layer
│   │   └── ScoreStorage.ts # Score storage
│   ├── ui/                 # UI components
│   │   ├── ScoreBoard.ts   # Score display
│   │   ├── GameControls.ts # Game buttons
│   │   └── SoundControls.ts# Sound controls
│   ├── main.ts             # Entry point
│   └── styles.css          # Responsive styles
├── tests/
│   ├── unit/               # Unit tests (Bun Test)
│   └── e2e/                # E2E tests (Playwright)
└── dist/                   # Production build output
```

## Quality Metrics

- **Test Coverage**: 87.36% (target: 85%)
- **Tests**: 151 passing
- **Bundle Size**: 16.7 KB (4.9 KB gzipped)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT

## Author

Junguk Hur
