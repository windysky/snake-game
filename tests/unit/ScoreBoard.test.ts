import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import { ScoreBoard } from "../../src/ui/ScoreBoard.ts";

describe("ScoreBoard", () => {
  let window: Window;
  let scoreBoard: ScoreBoard;

  beforeEach(() => {
    window = new Window();
    globalThis.document = window.document as unknown as Document;
    globalThis.localStorage = window.localStorage;
  });

  afterEach(() => {
    const element = document.getElementById("score-board");
    if (element) {
      element.remove();
    }
    window.happyDOM.cancelAsync();
  });

  describe("initialization", () => {
    it("should initialize with zero scores", () => {
      scoreBoard = new ScoreBoard();
      expect(scoreBoard.getCurrentScore()).toBe(0);
      expect(scoreBoard.getHighScore()).toBe(0);

      const element = document.getElementById("score-board");
      expect(element?.textContent).toContain("0");
    });

    it("should have proper ARIA labels", () => {
      scoreBoard = new ScoreBoard();
      const element = document.getElementById("score-board");

      expect(element?.getAttribute("role")).toBe("region");
      expect(element?.getAttribute("aria-label")).toBe("Score board");
      expect(element?.getAttribute("aria-live")).toBe("polite");
    });

    it("should create default element if container does not exist", () => {
      scoreBoard = new ScoreBoard({ containerId: "custom-score-board" });
      const element = document.getElementById("custom-score-board");

      expect(element).toBeTruthy();
      expect(element?.getAttribute("data-role")).toBe("scoreboard");
    });
  });

  describe("score updates", () => {
    beforeEach(() => {
      scoreBoard = new ScoreBoard();
    });

    it("should update current score display", () => {
      scoreBoard.updateScore(100);
      expect(scoreBoard.getCurrentScore()).toBe(100);

      const currentScoreEl = document
        .getElementById("score-board")
        ?.querySelector('[data-testid="current-score"]');
      expect(currentScoreEl?.textContent).toBe("100");
    });

    it("should update high score when current score exceeds it", () => {
      scoreBoard.updateScore(50);
      expect(scoreBoard.getHighScore()).toBe(50);

      const highScoreEl = document
        .getElementById("score-board")
        ?.querySelector('[data-testid="high-score"]');
      expect(highScoreEl?.textContent).toBe("50");
    });

    it("should not update high score if new score is lower", () => {
      scoreBoard.updateScore(100);
      scoreBoard.updateScore(50);
      expect(scoreBoard.getHighScore()).toBe(100);
    });

    it("should trigger callback on high score update", () => {
      let callbackScore = -1;
      const sb = new ScoreBoard(
        {},
        {
          onHighScoreUpdate: (score) => {
            callbackScore = score;
          },
        },
      );

      sb.updateScore(200);
      expect(callbackScore).toBe(200);
    });
  });

  describe("localStorage integration", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("should load high score from localStorage", () => {
      localStorage.setItem("snake_high_score", "150");
      scoreBoard = new ScoreBoard();

      expect(scoreBoard.getHighScore()).toBe(150);

      const highScoreEl = document
        .getElementById("score-board")
        ?.querySelector('[data-testid="high-score"]');
      expect(highScoreEl?.textContent).toBe("150");
    });

    it("should default to zero when no high score in localStorage", () => {
      scoreBoard = new ScoreBoard();

      expect(scoreBoard.getHighScore()).toBe(0);
    });

    it("should save high score to localStorage", () => {
      scoreBoard = new ScoreBoard();
      scoreBoard.updateScore(300);

      expect(localStorage.getItem("snake_high_score")).toBe("300");
    });

    it("should use custom storage key if provided", () => {
      localStorage.setItem("custom-key", "500");
      scoreBoard = new ScoreBoard({ highScoreStorageKey: "custom-key" });

      expect(scoreBoard.getHighScore()).toBe(500);
    });
  });

  describe("reset", () => {
    beforeEach(() => {
      scoreBoard = new ScoreBoard();
    });

    it("should reset current score to zero", () => {
      scoreBoard.updateScore(100);
      scoreBoard.reset();

      expect(scoreBoard.getCurrentScore()).toBe(0);

      const currentScoreEl = document
        .getElementById("score-board")
        ?.querySelector('[data-testid="current-score"]');
      expect(currentScoreEl?.textContent).toBe("0");
    });

    it("should not reset high score", () => {
      scoreBoard.updateScore(100);
      scoreBoard.reset();

      expect(scoreBoard.getHighScore()).toBe(100);
    });
  });
});
