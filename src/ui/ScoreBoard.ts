/**
 * ScoreBoard UI component
 * Displays current score and high score with ARIA support
 */

export type GameState = "menu" | "playing" | "paused" | "game_over";

export interface ScoreBoardOptions {
  containerId?: string;
  highScoreStorageKey?: string;
}

export interface ScoreBoardCallbacks {
  onHighScoreUpdate?: (score: number) => void;
}

export class ScoreBoard {
  private readonly element: HTMLElement;
  private readonly currentScoreEl: HTMLElement;
  private readonly highScoreEl: HTMLElement;
  private readonly storageKey: string;
  private currentScore = 0;
  private highScore = 0;
  private callbacks: ScoreBoardCallbacks;

  constructor(options: ScoreBoardOptions = {}, callbacks: ScoreBoardCallbacks = {}) {
    const containerId = options.containerId || "score-board";
    this.storageKey = options.highScoreStorageKey || "snake_high_score";
    this.callbacks = callbacks;

    // Get or create the score board element
    let container = document.getElementById(containerId);
    if (!container) {
      container = this.createDefaultElement(containerId);
      document.body.appendChild(container);
    }

    this.element = container;

    // Set up ARIA attributes
    this.element.setAttribute("role", "region");
    this.element.setAttribute("aria-label", "Score board");
    this.element.setAttribute("aria-live", "polite");

    // Get score elements
    this.currentScoreEl = this.element.querySelector('[data-testid="current-score"]')!;
    this.highScoreEl = this.element.querySelector('[data-testid="high-score"]')!;

    // Load high score from localStorage
    this.loadHighScore();
  }

  private createDefaultElement(id: string): HTMLElement {
    const container = document.createElement("div");
    container.id = id;
    container.setAttribute("data-role", "scoreboard");
    container.innerHTML = `
      <div class="score-display">
        <span class="score-label">Score:</span>
        <span data-testid="current-score">0</span>
      </div>
      <div class="score-display">
        <span class="score-label">High Score:</span>
        <span data-testid="high-score">0</span>
      </div>
    `;
    return container;
  }

  private loadHighScore(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored !== null) {
        this.highScore = Number.parseInt(stored, 10);
        this.highScoreEl.textContent = stored;
      }
    } catch {
      // localStorage unavailable (private browsing, etc.)
      // Continue with default high score of 0
    }
  }

  private saveHighScore(): void {
    try {
      localStorage.setItem(this.storageKey, this.highScore.toString());
      this.callbacks.onHighScoreUpdate?.(this.highScore);
    } catch {
      // localStorage unavailable (private browsing, quota exceeded, etc.)
      // Score update callback still fires for in-memory tracking
      this.callbacks.onHighScoreUpdate?.(this.highScore);
    }
  }

  updateScore(score: number): void {
    this.currentScore = score;
    this.currentScoreEl.textContent = score.toString();

    // Update high score if needed
    if (score > this.highScore) {
      this.highScore = score;
      this.highScoreEl.textContent = score.toString();
      this.saveHighScore();
    }
  }

  reset(): void {
    this.currentScore = 0;
    this.currentScoreEl.textContent = "0";
  }

  getCurrentScore(): number {
    return this.currentScore;
  }

  getHighScore(): number {
    return this.highScore;
  }
}
