import { beforeEach, describe, expect, test } from "bun:test";
import { ScoreStorage } from "../../src/storage/ScoreStorage";

// Mock localStorage for Bun test environment
class MockStorage implements Storage {
  private store: Map<string, string> = new Map();
  readonly length: number = 0;

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  key(): string | null {
    return null;
  }
}

// Set up global localStorage mock
const mockLocalStorage = new MockStorage();
globalThis.localStorage = mockLocalStorage;

describe("ScoreStorage", () => {
  let scoreStorage: ScoreStorage;

  beforeEach(() => {
    // Clear localStorage before each test
    mockLocalStorage.clear();
    scoreStorage = new ScoreStorage();
  });

  describe("high score", () => {
    test("should return 0 for initial high score", () => {
      expect(scoreStorage.getHighScore()).toBe(0);
    });

    test("should save high score when current score is higher", () => {
      scoreStorage.saveScore(100);
      expect(scoreStorage.getHighScore()).toBe(100);
    });

    test("should not update high score when current score is lower", () => {
      scoreStorage.saveScore(100);
      scoreStorage.saveScore(50);
      expect(scoreStorage.getHighScore()).toBe(100);
    });

    test("should update high score when current score equals high score", () => {
      scoreStorage.saveScore(100);
      scoreStorage.saveScore(100);
      expect(scoreStorage.getHighScore()).toBe(100);
    });

    test("should update high score when current score is higher", () => {
      scoreStorage.saveScore(50);
      scoreStorage.saveScore(100);
      expect(scoreStorage.getHighScore()).toBe(100);
    });
  });

  describe("score history", () => {
    test("should return empty history initially", () => {
      const history = scoreStorage.getScoreHistory();
      expect(history).toEqual([]);
    });

    test("should add scores to history", () => {
      scoreStorage.saveScore(50);
      scoreStorage.saveScore(100);

      const history = scoreStorage.getScoreHistory();
      expect(history.length).toBe(2);
      expect(history[0].score).toBe(50);
      expect(history[1].score).toBe(100);
    });

    test("should include timestamps in history", () => {
      const beforeSave = Date.now();
      scoreStorage.saveScore(100);
      const afterSave = Date.now();

      const history = scoreStorage.getScoreHistory();
      expect(history.length).toBe(1);
      expect(history[0].timestamp).toBeGreaterThanOrEqual(beforeSave);
      expect(history[0].timestamp).toBeLessThanOrEqual(afterSave);
    });

    test("should limit history to 100 entries", () => {
      // Save 150 scores
      for (let i = 0; i < 150; i++) {
        scoreStorage.saveScore(i);
      }

      const history = scoreStorage.getScoreHistory();
      expect(history.length).toBe(100);
    });

    test("should keep most recent entries when limit exceeded", () => {
      // Save 105 scores
      for (let i = 0; i < 105; i++) {
        scoreStorage.saveScore(i);
      }

      const history = scoreStorage.getScoreHistory();
      expect(history.length).toBe(100);
      // Should have scores 5-104 (most recent 100)
      expect(history[0].score).toBe(5);
      expect(history[99].score).toBe(104);
    });
  });

  describe("localStorage fallback", () => {
    test("should use memory fallback when localStorage is unavailable", () => {
      // Save original localStorage
      const originalLocalStorage = globalThis.localStorage;

      // Remove localStorage to test memory fallback
      // @ts-expect-error - intentionally removing localStorage
      globalThis.localStorage = undefined;

      const fallbackStorage = new ScoreStorage();
      fallbackStorage.saveScore(100);

      // Should still work with memory fallback
      expect(fallbackStorage.getHighScore()).toBe(100);

      // Restore localStorage
      globalThis.localStorage = originalLocalStorage;
    });

    test("should persist scores across instances when localStorage works", () => {
      scoreStorage.saveScore(100);

      // Create new instance - should read from localStorage
      const newStorage = new ScoreStorage();
      expect(newStorage.getHighScore()).toBe(100);
    });

    test("should handle quota exceeded errors gracefully", () => {
      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem = () => {
        throw new DOMException("QuotaExceededError");
      };

      // Create new instance AFTER mock is set up
      const quotaStorage = new ScoreStorage();
      quotaStorage.saveScore(100);

      // Should use memory fallback and still work
      expect(quotaStorage.getHighScore()).toBe(100);

      // Restore original
      mockLocalStorage.setItem = originalSetItem;
    });
  });

  describe("clear", () => {
    test("should clear all scores", () => {
      scoreStorage.saveScore(100);
      scoreStorage.saveScore(200);

      scoreStorage.clear();

      expect(scoreStorage.getHighScore()).toBe(0);
      expect(scoreStorage.getScoreHistory()).toEqual([]);
    });
  });

  describe("error handling", () => {
    test("should gracefully handle localStorage getItem errors", () => {
      // Mock localStorage.getItem to throw
      const originalGetItem = mockLocalStorage.getItem;
      mockLocalStorage.getItem = () => {
        throw new Error("localStorage error");
      };

      const errorStorage = new ScoreStorage();
      // Should not throw
      expect(() => errorStorage.getHighScore()).not.toThrow();

      // Restore original
      mockLocalStorage.getItem = originalGetItem;
    });

    test("should handle negative scores", () => {
      scoreStorage.saveScore(-10);
      expect(scoreStorage.getHighScore()).toBe(0);
    });

    test("should handle zero score", () => {
      scoreStorage.saveScore(0);
      expect(scoreStorage.getHighScore()).toBe(0);
    });
  });
});
