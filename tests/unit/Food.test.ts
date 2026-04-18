// @MX:NOTE: Food system tests - verifies random placement and consumption detection
// @MX:SPEC: SPEC-GAME-001

import { beforeEach, describe, expect, test } from "bun:test";
import { Food } from "../../src/game/Food";

describe("Food", () => {
  let food: Food;
  const canvasWidth = 800;
  const canvasHeight = 600;
  const cellSize = 20;

  beforeEach(() => {
    food = new Food(canvasWidth, canvasHeight, cellSize);
  });

  describe("initial state", () => {
    test("should spawn at random position", () => {
      const position = food.getPosition();
      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.x).toBeLessThan(canvasWidth);
      expect(position.y).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeLessThan(canvasHeight);
    });

    test("should be aligned to grid", () => {
      const position = food.getPosition();
      expect(position.x % cellSize).toBe(0);
      expect(position.y % cellSize).toBe(0);
    });
  });

  describe("position", () => {
    test("should get current position", () => {
      const position = food.getPosition();
      expect(position).toBeDefined();
      expect(typeof position.x).toBe("number");
      expect(typeof position.y).toBe("number");
    });

    test("should relocate to new random position", () => {
      const initialPosition = food.getPosition();
      food.relocate();
      const newPosition = food.getPosition();

      // New position should be different (very unlikely to be same)
      expect(newPosition.x !== initialPosition.x || newPosition.y !== initialPosition.y).toBe(true);
    });

    test("should relocate to valid position", () => {
      food.relocate();
      const position = food.getPosition();

      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.x).toBeLessThan(canvasWidth);
      expect(position.y).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeLessThan(canvasHeight);
      expect(position.x % cellSize).toBe(0);
      expect(position.y % cellSize).toBe(0);
    });

    test("should relocate avoiding occupied positions", () => {
      const occupiedPositions = [
        { x: 100, y: 100 },
        { x: 200, y: 200 },
        { x: 300, y: 300 },
      ];

      const position = food.relocate(occupiedPositions);

      // Should not be at any occupied position
      let isOccupied = false;
      for (const occupied of occupiedPositions) {
        if (position.x === occupied.x && position.y === occupied.y) {
          isOccupied = true;
          break;
        }
      }
      expect(isOccupied).toBe(false);
    });

    test("should handle when all positions are occupied", () => {
      // Create occupied positions covering entire canvas
      const occupiedPositions: Array<{ x: number; y: number }> = [];
      for (let x = 0; x < canvasWidth; x += cellSize) {
        for (let y = 0; y < canvasHeight; y += cellSize) {
          occupiedPositions.push({ x, y });
        }
      }

      // Should still return a valid position (last resort)
      const position = food.relocate(occupiedPositions);
      expect(position).toBeDefined();
    });
  });

  describe("collision detection", () => {
    test("should detect collision at food position", () => {
      const foodPosition = food.getPosition();
      expect(food.checkCollision(foodPosition.x, foodPosition.y)).toBe(true);
    });

    test("should not detect collision at different position", () => {
      const foodPosition = food.getPosition();
      const differentX = foodPosition.x === 0 ? cellSize : 0;
      expect(food.checkCollision(differentX, foodPosition.y)).toBe(false);
    });

    test("should not detect collision at nearby position", () => {
      const foodPosition = food.getPosition();
      expect(food.checkCollision(foodPosition.x + 1, foodPosition.y)).toBe(false);
      expect(food.checkCollision(foodPosition.x, foodPosition.y + 1)).toBe(false);
    });
  });

  describe("consumption", () => {
    test("should indicate food was eaten when colliding", () => {
      const foodPosition = food.getPosition();
      const eaten = food.checkCollision(foodPosition.x, foodPosition.y);
      expect(eaten).toBe(true);
    });

    test("should relocate to new position", () => {
      const initialPosition = food.getPosition();
      food.relocate();
      const newPosition = food.getPosition();

      // Position should change after relocating
      expect(newPosition.x !== initialPosition.x || newPosition.y !== initialPosition.y).toBe(true);
    });
  });

  describe("grid alignment", () => {
    test("should maintain grid alignment after multiple relocates", () => {
      for (let i = 0; i < 10; i++) {
        food.relocate();
        const position = food.getPosition();
        expect(position.x % cellSize).toBe(0);
        expect(position.y % cellSize).toBe(0);
      }
    });
  });

  describe("edge cases", () => {
    test("should not spawn on right edge", () => {
      for (let i = 0; i < 100; i++) {
        food.relocate();
        const position = food.getPosition();
        expect(position.x).toBeLessThan(canvasWidth);
      }
    });

    test("should not spawn on bottom edge", () => {
      for (let i = 0; i < 100; i++) {
        food.relocate();
        const position = food.getPosition();
        expect(position.y).toBeLessThan(canvasHeight);
      }
    });

    test("should handle empty occupied positions array", () => {
      const position = food.relocate([]);
      expect(position).toBeDefined();
      expect(position.x % cellSize).toBe(0);
      expect(position.y % cellSize).toBe(0);
    });
  });
});
