import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import { GameControls } from "../../src/ui/GameControls.ts";

describe("GameControls", () => {
  let window: Window;
  let controls: GameControls;

  beforeEach(() => {
    window = new Window();
    globalThis.document = window.document as unknown as Document;
  });

  afterEach(() => {
    if (controls) {
      controls.destroy();
    }
    const element = document.getElementById("game-controls");
    if (element) {
      element.remove();
    }
    window.happyDOM.cancelAsync();
  });

  describe("initialization", () => {
    it("should show only Start button initially", () => {
      controls = new GameControls();

      const startBtn = document.querySelector('[data-testid="start-btn"]');
      const pauseBtn = document.querySelector('[data-testid="pause-btn"]');
      const restartBtn = document.querySelector('[data-testid="restart-btn"]');

      // Start button should not have display: none
      expect(startBtn?.getAttribute("style")).toBeNull();
      expect(pauseBtn?.getAttribute("style")).toBe("display: none;");
      expect(restartBtn?.getAttribute("style")).toBe("display: none;");
    });

    it("should have proper ARIA labels on all buttons", () => {
      controls = new GameControls();

      const startBtn = document.querySelector('[data-testid="start-btn"]');
      const pauseBtn = document.querySelector('[data-testid="pause-btn"]');
      const restartBtn = document.querySelector('[data-testid="restart-btn"]');

      expect(startBtn?.getAttribute("aria-label")).toBe("Start game");
      expect(pauseBtn?.getAttribute("aria-label")).toBe("Pause game");
      expect(restartBtn?.getAttribute("aria-label")).toBe("Restart game");
    });
  });

  describe("game state changes", () => {
    beforeEach(() => {
      controls = new GameControls();
    });

    it("should hide Start and show Pause when playing", () => {
      controls.setState("playing");

      const startBtn = document.querySelector('[data-testid="start-btn"]');
      const pauseBtn = document.querySelector('[data-testid="pause-btn"]');

      expect(startBtn?.getAttribute("style")).toBe("display: none;");
      expect(pauseBtn?.getAttribute("style")).not?.toContain("display: none");
    });

    it("should change Pause button text to Resume when paused", () => {
      controls.setState("playing");
      controls.setState("paused");

      const pauseBtn = document.querySelector('[data-testid="pause-btn"]');
      expect(pauseBtn?.textContent).toBe("Resume");
      expect(pauseBtn?.getAttribute("aria-label")).toBe("Resume game");
    });

    it("should show Restart button when game over", () => {
      controls.setState("game_over");

      const restartBtn = document.querySelector('[data-testid="restart-btn"]');
      expect(restartBtn?.getAttribute("style")).not?.toContain("display: none");
    });

    it("should return to menu state", () => {
      controls.setState("playing");
      controls.setState("menu");

      const startBtn = document.querySelector('[data-testid="start-btn"]');
      const pauseBtn = document.querySelector('[data-testid="pause-btn"]');

      expect(startBtn?.getAttribute("style")).not?.toContain("display: none");
      expect(pauseBtn?.getAttribute("style")).toBe("display: none;");
    });
  });

  describe("button interactions", () => {
    it("should trigger onStart callback on Start button click", async () => {
      let startCalled = false;
      controls = new GameControls(
        {},
        {
          onStart: () => {
            startCalled = true;
          },
        },
      );

      const startBtn = document.querySelector('[data-testid="start-btn"]') as HTMLButtonElement;
      startBtn.click();

      expect(startCalled).toBe(true);
    });

    it("should trigger onPause callback on Pause button click", () => {
      let pauseCalled = false;
      controls = new GameControls(
        {},
        {
          onPause: () => {
            pauseCalled = true;
          },
        },
      );

      controls.setState("playing");

      const pauseBtn = document.querySelector('[data-testid="pause-btn"]') as HTMLButtonElement;
      pauseBtn.click();

      expect(pauseCalled).toBe(true);
    });

    it("should trigger onResume callback on Resume button click", () => {
      let resumeCalled = false;
      controls = new GameControls(
        {},
        {
          onResume: () => {
            resumeCalled = true;
          },
        },
      );

      controls.setState("playing");
      controls.setState("paused");

      const pauseBtn = document.querySelector('[data-testid="pause-btn"]') as HTMLButtonElement;
      pauseBtn.click();

      expect(resumeCalled).toBe(true);
    });

    it("should trigger onRestart callback on Restart button click", () => {
      let restartCalled = false;
      controls = new GameControls(
        {},
        {
          onRestart: () => {
            restartCalled = true;
          },
        },
      );

      controls.setState("game_over");

      const restartBtn = document.querySelector('[data-testid="restart-btn"]') as HTMLButtonElement;
      restartBtn.click();

      expect(restartCalled).toBe(true);
    });
  });

  describe("cleanup", () => {
    it("should not throw on destroy", () => {
      controls = new GameControls();
      expect(() => controls.destroy()).not.toThrow();
    });
  });
});
