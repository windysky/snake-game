/**
 * Main entry point for the Snake Game
 * Initializes all UI components and sets up the game loop
 */

import { SoundManager } from "./audio/SoundManager.ts";
import { Food } from "./game/Food.ts";
import { Renderer } from "./game/Renderer.ts";
import { type Direction, isOppositeDirection, Snake } from "./game/Snake.ts";
import { ScoreStorage } from "./storage/ScoreStorage.ts";
import { GameControls } from "./ui/GameControls.ts";
import { ScoreBoard } from "./ui/ScoreBoard.ts";
import { SoundControls } from "./ui/SoundControls.ts";

// Game configuration
const CELL_SIZE = 20;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const MOVE_INTERVAL = 150; // Base snake speed (ms)
const MIN_MOVE_INTERVAL = 60; // Fastest speed
const SPEED_INCREASE_PER_FOOD = 2; // ms faster per food eaten

// Global game state
let snake: Snake;
let food: Food;
let renderer: Renderer;
let scoreBoard: ScoreBoard;
let gameControls: GameControls;
let _soundControls: SoundControls;
let soundManager: SoundManager;
let scoreStorage: ScoreStorage;
let gameState: "menu" | "playing" | "paused" | "game_over" = "menu";
let score = 0;
let highScore = 0;
let lastMoveTime = 0;
let currentMoveInterval = MOVE_INTERVAL;
let pulsePhase = 0;
const scorePopups: Array<{ x: number; y: number; text: string; alpha: number }> = [];
let animationFrameId: number | null = null;

// Keyboard input
let currentDirection: Direction = "right";
let nextDirection: Direction = "right";

/**
 * Initialize the game
 */
function init(): void {
  console.log("Snake Game initializing...");

  // Get canvas element
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  if (!canvas) {
    console.error("Canvas element not found!");
    return;
  }

  // Initialize game entities
  snake = new Snake(CANVAS_WIDTH, CANVAS_HEIGHT, CELL_SIZE);
  food = new Food(CANVAS_WIDTH, CANVAS_HEIGHT, CELL_SIZE);
  renderer = new Renderer(canvas);

  // Initialize storage
  scoreStorage = new ScoreStorage();
  highScore = scoreStorage.getHighScore() || 0;

  // Initialize UI components
  scoreBoard = new ScoreBoard(
    {},
    {
      onHighScoreUpdate: (newScore) => {
        console.log(`New high score: ${newScore}`);
      },
    },
  );
  scoreBoard.updateScore(0);

  gameControls = new GameControls(
    {},
    {
      onStart: handleStart,
      onPause: handlePause,
      onResume: handleResume,
      onRestart: handleRestart,
    },
  );

  soundManager = new SoundManager();
  soundManager.initialize();

  _soundControls = new SoundControls(
    { defaultVolume: 50 },
    {
      onVolumeChange: (volume) => {
        soundManager.setVolume(volume);
      },
      onMuteToggle: (muted) => {
        soundManager.setMuted(muted);
      },
    },
  );

  // Set up keyboard input for direction
  document.addEventListener("keydown", handleKeyDown);

  // Set up touch/swipe input for mobile
  setupTouchControls(canvas);

  // Initial render
  render();

  console.log("Snake Game initialized!");
  console.log("Controls: Arrow Keys/WASD to move, Space to pause, R to restart");

  // Register service worker for offline support
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
}

/**
 * Handle start button click
 */
function handleStart(): void {
  if (gameState === "menu" || gameState === "game_over" || gameState === "paused") {
    gameState = "playing";
    score = 0;
    scoreBoard.updateScore(0);

    // Reset snake and food
    snake = new Snake(CANVAS_WIDTH, CANVAS_HEIGHT, CELL_SIZE);
    food.relocate(snake.getSegments());

    currentDirection = "right";
    nextDirection = "right";
    lastMoveTime = performance.now();
    currentMoveInterval = MOVE_INTERVAL;
    pulsePhase = 0;
    scorePopups.length = 0;

    // Update UI
    gameControls.setState(gameState);

    // Start game loop
    startGameLoop();
  }
}

/**
 * Handle pause button click
 */
function handlePause(): void {
  if (gameState === "playing") {
    gameState = "paused";
    gameControls.setState(gameState);
  }
}

/**
 * Handle resume button click
 */
function handleResume(): void {
  if (gameState === "paused") {
    gameState = "playing";
    gameControls.setState(gameState);
  }
}

/**
 * Handle restart button click
 */
function handleRestart(): void {
  if (gameState === "paused" || gameState === "game_over") {
    handleStart();
  }
}

/**
 * Handle keyboard input
 */
function handleKeyDown(e: KeyboardEvent): void {
  // Skip game controls when focus is on an input element
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement ||
    e.target instanceof HTMLSelectElement
  ) {
    return;
  }

  // Prevent default for game keys
  if (
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Space",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
    ].includes(e.code)
  ) {
    e.preventDefault();
  }

  const newDirection = getDirectionFromKey(e.code);
  if (newDirection && gameState === "playing") {
    // Prevent 180-degree turns — check against queued direction, not last frame's
    if (!isOppositeDirection(nextDirection, newDirection)) {
      nextDirection = newDirection;
    }
  }

  // Space for pause/resume
  if (e.code === "Space") {
    if (gameState === "playing") {
      handlePause();
    } else if (gameState === "paused") {
      handleResume();
    }
  }

  // R for restart
  if (e.code === "KeyR") {
    if (gameState === "game_over" || gameState === "paused") {
      handleRestart();
    }
  }

  // Escape for menu
  if (e.code === "Escape") {
    if (gameState === "playing" || gameState === "paused") {
      gameState = "menu";
      gameControls.setState(gameState);
      stopGameLoop();
      scorePopups.length = 0;
      render();
    }
  }
}

/**
 * Get direction from keyboard code
 */
function getDirectionFromKey(code: string): Direction | null {
  switch (code) {
    case "ArrowUp":
    case "KeyW":
      return "up";
    case "ArrowDown":
    case "KeyS":
      return "down";
    case "ArrowLeft":
    case "KeyA":
      return "left";
    case "ArrowRight":
    case "KeyD":
      return "right";
    default:
      return null;
  }
}

/**
 * Start the game loop
 */
function startGameLoop(): void {
  if (animationFrameId !== null) {
    return;
  }

  let lastTime = performance.now();

  const gameLoop = (timestamp: number) => {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);
    render(deltaTime);

    if (gameState !== "game_over") {
      animationFrameId = requestAnimationFrame(gameLoop);
    } else {
      animationFrameId = null;
    }
  };

  animationFrameId = requestAnimationFrame(gameLoop);
}

/**
 * Stop the game loop
 */
function stopGameLoop(): void {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

/**
 * Update game state
 */
function update(deltaTime: number): void {
  if (gameState !== "playing") {
    return;
  }

  lastMoveTime += deltaTime;

  if (lastMoveTime >= currentMoveInterval) {
    lastMoveTime = 0;

    // Update direction
    currentDirection = nextDirection;
    snake.setDirection(currentDirection);

    // Move snake (also checks collisions internally)
    snake.move();

    // Check if snake collided after moving
    if (snake.hasCollided()) {
      handleGameOver();
      return;
    }

    // Check food collision
    const head = snake.getHeadPosition();
    if (food.checkCollision(head.x, head.y)) {
      // Eat food
      snake.grow();
      score += 10;
      scoreBoard.updateScore(score);

      // Play sound
      soundManager.playEat();

      // Relocate food
      food.relocate(snake.getSegments());

      // Increase speed
      currentMoveInterval = Math.max(
        MIN_MOVE_INTERVAL,
        currentMoveInterval - SPEED_INCREASE_PER_FOOD,
      );

      // Score popup
      scorePopups.push({ x: head.x, y: head.y, text: "+10", alpha: 1.0 });

      // Particle burst
      renderer.spawnParticles(head.x, head.y, "#fbbf24", 8);
    }
  }
}

/**
 * Handle game over
 */
function handleGameOver(): void {
  gameState = "game_over";
  gameControls.setState(gameState);
  stopGameLoop();

  // Play game over sound
  soundManager.playGameOver();

  // Screen shake effect
  renderer.shake(6, 400);

  // Save final score (updates high score and adds to history)
  if (score > highScore) {
    highScore = score;
  }
  scoreStorage.saveScore(score);

  render();
}

/**
 * Render the game
 */
function render(deltaTime = 16.67): void {
  renderer.clear();

  switch (gameState) {
    case "menu":
      renderMenu();
      break;
    case "playing":
    case "paused":
      renderGame(deltaTime);
      break;
    case "game_over":
      renderGame(deltaTime);
      renderGameOver();
      break;
  }
}

/**
 * Render menu screen
 */
function renderMenu(): void {
  const centerX = Math.floor(CANVAS_WIDTH / 2);
  const centerY = Math.floor(CANVAS_HEIGHT / 2);

  renderer.drawText("SNAKE GAME", centerX, centerY - 40, "#4ade80", 48);
  renderer.drawText("Press Start to Play", centerX, centerY + 20, "#ffffff", 24);
  renderer.drawText("Use Arrow Keys or WASD to move", centerX, centerY + 60, "#9ca3af", 16);
}

/**
 * Render game elements
 */
function renderGame(deltaTime: number): void {
  // Update animation phase
  pulsePhase += 0.15;

  // Draw grid overlay for visual orientation
  renderer.drawGrid(CELL_SIZE, "rgba(255,255,255,0.03)");

  // Draw snake
  renderer.drawSnake(snake.getSegments(), "#4ade80", CELL_SIZE);

  // Draw food with pulse
  renderer.drawFood(food.getPosition(), "#f87171", CELL_SIZE, pulsePhase);

  // Draw score popups
  renderer.updateAndDrawParticles(deltaTime);
  for (let i = scorePopups.length - 1; i >= 0; i--) {
    const popup = scorePopups[i];
    renderer.drawScorePopup(
      popup.x + CELL_SIZE / 2,
      popup.y - (1 - popup.alpha) * 30,
      popup.text,
      popup.alpha,
    );
    popup.alpha -= 0.03 * (deltaTime / 16.67);
    if (popup.alpha <= 0) {
      scorePopups.splice(i, 1);
    }
  }

  // Draw pause overlay
  if (gameState === "paused") {
    const centerX = Math.floor(CANVAS_WIDTH / 2);
    const centerY = Math.floor(CANVAS_HEIGHT / 2);
    renderer.drawText("PAUSED", centerX, centerY, "#ffffff", 48);
  }
}

/**
 * Render game over screen
 */
function renderGameOver(): void {
  const centerX = Math.floor(CANVAS_WIDTH / 2);
  const centerY = Math.floor(CANVAS_HEIGHT / 2);

  // Semi-transparent overlay
  const ctx = renderer.getContext();
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  renderer.drawText("GAME OVER", centerX, centerY - 40, "#f87171", 48);
  renderer.drawText(`Final Score: ${score}`, centerX, centerY + 10, "#ffffff", 32);

  if (score === highScore && score > 0) {
    renderer.drawText("New High Score!", centerX, centerY + 50, "#fbbf24", 24);
  }

  renderer.drawText("Press Restart or R to Play Again", centerX, centerY + 90, "#9ca3af", 16);
}

// Touch input state
let touchStartX = 0;
let touchStartY = 0;
const MIN_SWIPE_DISTANCE = 30;

function setupTouchControls(canvas: HTMLCanvasElement): void {
  canvas.style.touchAction = "none";

  canvas.addEventListener(
    "touchstart",
    (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;

      // Tap to start/restart
      if (gameState === "menu" || gameState === "game_over") {
        handleStart();
      }
    },
    { passive: false },
  );

  canvas.addEventListener(
    "touchmove",
    (e: TouchEvent) => {
      e.preventDefault();
    },
    { passive: false },
  );

  canvas.addEventListener(
    "touchend",
    (e: TouchEvent) => {
      e.preventDefault();
      if (e.changedTouches.length === 0) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (Math.max(absDeltaX, absDeltaY) < MIN_SWIPE_DISTANCE) return;

      let newDirection: Direction;
      if (absDeltaX > absDeltaY) {
        newDirection = deltaX > 0 ? "right" : "left";
      } else {
        newDirection = deltaY > 0 ? "down" : "up";
      }

      if (gameState === "playing" && !isOppositeDirection(nextDirection, newDirection)) {
        nextDirection = newDirection;
      }
    },
    { passive: false },
  );
}

// Start the application when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
