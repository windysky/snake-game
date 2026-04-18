/**
 * GameControls UI component
 * Provides Start, Pause, and Restart buttons with keyboard shortcuts
 */

import type { GameState } from "./ScoreBoard.ts";

export interface GameControlsOptions {
  containerId?: string;
}

export interface GameControlsCallbacks {
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onRestart?: () => void;
}

export class GameControls {
  private readonly element: HTMLElement;
  private readonly startBtn: HTMLButtonElement;
  private readonly pauseBtn: HTMLButtonElement;
  private readonly restartBtn: HTMLButtonElement;
  private currentState: GameState;
  private callbacks: GameControlsCallbacks;

  constructor(options: GameControlsOptions = {}, callbacks: GameControlsCallbacks = {}) {
    const containerId = options.containerId || "game-controls";
    this.currentState = "menu";
    this.callbacks = callbacks;

    // Get or create the controls element
    let container = document.getElementById(containerId);
    if (!container) {
      container = this.createDefaultElement(containerId);
      document.body.appendChild(container);
    }

    this.element = container;

    // Get button elements
    this.startBtn = this.element.querySelector('[data-testid="start-btn"]')!;
    this.pauseBtn = this.element.querySelector('[data-testid="pause-btn"]')!;
    this.restartBtn = this.element.querySelector('[data-testid="restart-btn"]')!;

    // Set up event listeners
    this.setupEventListeners();
  }

  private createDefaultElement(id: string): HTMLElement {
    const container = document.createElement("div");
    container.id = id;
    container.setAttribute("data-role", "game-controls");
    container.innerHTML = `
      <button id="btn-start" data-testid="start-btn" aria-label="Start game">Start</button>
      <button id="btn-pause" data-testid="pause-btn" aria-label="Pause game" style="display: none;">Pause</button>
      <button id="btn-restart" data-testid="restart-btn" aria-label="Restart game" style="display: none;">Restart</button>
    `;
    return container;
  }

  private setupEventListeners(): void {
    this.startBtn.addEventListener("click", () => {
      this.callbacks.onStart?.();
    });

    this.pauseBtn.addEventListener("click", () => {
      if (this.currentState === "paused") {
        this.callbacks.onResume?.();
      } else {
        this.callbacks.onPause?.();
      }
    });

    this.restartBtn.addEventListener("click", () => {
      this.callbacks.onRestart?.();
    });
  }

  private updateUI(): void {
    switch (this.currentState) {
      case "menu":
        this.startBtn.style.display = "inline-block";
        this.pauseBtn.style.display = "none";
        this.restartBtn.style.display = "none";
        break;
      case "playing":
        this.startBtn.style.display = "none";
        this.pauseBtn.style.display = "inline-block";
        this.pauseBtn.textContent = "Pause";
        this.pauseBtn.setAttribute("aria-label", "Pause game");
        this.restartBtn.style.display = "none";
        break;
      case "paused":
        this.startBtn.style.display = "none";
        this.pauseBtn.style.display = "inline-block";
        this.pauseBtn.textContent = "Resume";
        this.pauseBtn.setAttribute("aria-label", "Resume game");
        this.restartBtn.style.display = "inline-block";
        break;
      case "game_over":
        this.startBtn.style.display = "none";
        this.pauseBtn.style.display = "none";
        this.restartBtn.style.display = "inline-block";
        break;
    }
  }

  setState(state: GameState): void {
    this.currentState = state;
    this.updateUI();
  }

  getState(): GameState {
    return this.currentState;
  }

  destroy(): void {
    // No-op: kept for API compatibility
  }
}
