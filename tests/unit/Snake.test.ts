// @MX:NOTE: Snake entity tests - verifies movement, growth, and collision detection
// @MX:SPEC: SPEC-GAME-001

import { beforeEach, describe, expect, test } from "bun:test";
import { Snake } from "../../src/game/Snake";

describe("Snake", () => {
  let snake: Snake;
  const canvasWidth = 800;
  const canvasHeight = 600;
  const cellSize = 20;

  beforeEach(() => {
    snake = new Snake(canvasWidth, canvasHeight, cellSize);
  });

  // REQ-GAME-010: Direction changes with arrow keys
  describe("direction changes", () => {
    test("should start with default right direction", () => {
      expect(snake.getDirection()).toBe("right");
    });

    test("should change to up direction", () => {
      snake.setDirection("up");
      snake.update();
      expect(snake.getDirection()).toBe("up");
    });

    test("should change to down direction", () => {
      snake.setDirection("down");
      snake.update();
      expect(snake.getDirection()).toBe("down");
    });

    test("should change to left direction (via up first)", () => {
      snake.setDirection("up");
      snake.update();
      snake.setDirection("left");
      snake.update();
      expect(snake.getDirection()).toBe("left");
    });

    // REQ-GAME-030: No 180-degree instant reversal
    test("should not allow 180-degree reversal from right to left", () => {
      snake.setDirection("left");
      snake.update();
      expect(snake.getDirection()).toBe("right");
    });

    test("should not allow 180-degree reversal from left to right", () => {
      snake.setDirection("up");
      snake.update();
      snake.setDirection("left");
      snake.update();
      snake.setDirection("right"); // Opposite to left, should be blocked
      snake.update();
      expect(snake.getDirection()).toBe("left");
    });

    test("should not allow 180-degree reversal from up to down", () => {
      snake.setDirection("up");
      snake.update();
      snake.setDirection("down");
      snake.update();
      expect(snake.getDirection()).toBe("up");
    });

    test("should not allow 180-degree reversal from down to up", () => {
      snake.setDirection("down");
      snake.update();
      snake.setDirection("up");
      snake.update();
      expect(snake.getDirection()).toBe("down");
    });
  });

  // REQ-GAME-034: Direction queue
  describe("direction queue", () => {
    test("should queue multiple direction changes", () => {
      snake.setDirection("up");
      snake.setDirection("left");
      expect(snake.getQueueLength()).toBe(2);
    });

    test("should process queued directions on update", () => {
      snake.setDirection("up");
      snake.update();
      expect(snake.getDirection()).toBe("up");

      snake.setDirection("left");
      snake.update();
      expect(snake.getDirection()).toBe("left");
    });

    test("should limit queue size to prevent input spam", () => {
      for (let i = 0; i < 10; i++) {
        snake.setDirection("up");
      }
      expect(snake.getQueueLength()).toBeLessThanOrEqual(2);
    });
  });

  describe("movement", () => {
    test("should move in current direction", () => {
      const initialHead = snake.getHeadPosition();
      snake.update();
      const newHead = snake.getHeadPosition();
      expect(newHead.x).toBe(initialHead.x + cellSize);
      expect(newHead.y).toBe(initialHead.y);
    });

    test("should move up when direction is up", () => {
      snake.setDirection("up");
      snake.update();
      const initialHead = snake.getHeadPosition();
      snake.update();
      const newHead = snake.getHeadPosition();
      expect(newHead.x).toBe(initialHead.x);
      expect(newHead.y).toBe(initialHead.y - cellSize);
    });

    test("should move down when direction is down", () => {
      snake.setDirection("down");
      snake.update();
      const initialHead = snake.getHeadPosition();
      snake.update();
      const newHead = snake.getHeadPosition();
      expect(newHead.x).toBe(initialHead.x);
      expect(newHead.y).toBe(initialHead.y + cellSize);
    });

    test("should move left when direction is left (via up first)", () => {
      snake.setDirection("up");
      snake.update();
      snake.setDirection("left");
      snake.update();
      const initialHead = snake.getHeadPosition();
      snake.update();
      const newHead = snake.getHeadPosition();
      expect(newHead.x).toBe(initialHead.x - cellSize);
      expect(newHead.y).toBe(initialHead.y);
    });
  });

  // REQ-GAME-011: Snake grows when eating food
  describe("growth", () => {
    test("should grow by one segment when eating", () => {
      const initialLength = snake.getLength();
      snake.grow();
      expect(snake.getLength()).toBe(initialLength + 1);
    });

    test("should maintain tail after growth", () => {
      const initialSegments = snake.getSegments().length;
      snake.grow();
      expect(snake.getSegments().length).toBe(initialSegments + 1);
    });
  });

  // REQ-GAME-012: Collision detection
  describe("collision detection", () => {
    test("should detect wall collision on right edge", () => {
      // Position snake at right edge
      snake.setPosition(canvasWidth - cellSize, 300);
      snake.setDirection("right");
      snake.update();
      expect(snake.hasCollided()).toBe(true);
    });

    test("should detect wall collision on left edge", () => {
      // Position at left edge
      snake.setPosition(0, 300);
      snake.setDirection("up"); // Change to non-opposite direction first
      snake.update();
      snake.setDirection("left"); // Now we can go left
      snake.update(); // Move to x=-20 (out of bounds)
      expect(snake.hasCollided()).toBe(true);
    });

    test("should detect wall collision on top edge", () => {
      // Position at top edge
      snake.setPosition(400, 0);
      snake.setDirection("up");
      snake.update(); // Move to y=-20 (out of bounds)
      expect(snake.hasCollided()).toBe(true);
    });

    test("should detect wall collision on bottom edge", () => {
      snake.setPosition(400, canvasHeight - cellSize);
      snake.setDirection("down");
      snake.update();
      expect(snake.hasCollided()).toBe(true);
    });

    test("should detect self collision", () => {
      // Grow snake to create a longer body
      for (let i = 0; i < 5; i++) {
        snake.grow();
      }

      // Move right, then up, then left into the body
      // This creates a "U" turn that causes self-collision
      const segments = snake.getSegments();
      const headX = segments[0].x;
      const headY = segments[0].y;

      // Position snake so we can create self-collision
      // by turning back into the body after moving away
      snake.setPosition(headX, headY);

      // Move up
      snake.setDirection("up");
      snake.update();

      // Move left
      snake.setDirection("left");
      snake.update();

      // Move down into body
      snake.setDirection("down");
      snake.update();

      // Should have collided with body
      expect(snake.hasCollided()).toBe(true);
    });

    test("should not detect collision when safe", () => {
      expect(snake.hasCollided()).toBe(false);
    });
  });

  describe("initial state", () => {
    test("should start with initial length of 3", () => {
      expect(snake.getLength()).toBe(3);
    });

    test("should start at center position", () => {
      const head = snake.getHeadPosition();
      expect(head.x).toBeCloseTo(canvasWidth / 2, -1);
      expect(head.y).toBeCloseTo(canvasHeight / 2, -1);
    });

    test("should have aligned segments on grid", () => {
      const segments = snake.getSegments();
      for (const segment of segments) {
        expect(segment.x % cellSize).toBe(0);
        expect(segment.y % cellSize).toBe(0);
      }
    });
  });

  describe("reset", () => {
    test("should reset to initial state", () => {
      snake.setDirection("up");
      snake.grow();
      snake.grow();
      snake.reset();

      expect(snake.getDirection()).toBe("right");
      expect(snake.getLength()).toBe(3);
      expect(snake.hasCollided()).toBe(false);
    });
  });

  describe("body segments", () => {
    test("should return all segments", () => {
      const segments = snake.getSegments();
      expect(segments.length).toBe(3);
      expect(segments[0]).toBeDefined();
      expect(segments[1]).toBeDefined();
      expect(segments[2]).toBeDefined();
    });

    test("segments should follow head position", () => {
      const head = snake.getHeadPosition();
      const segments = snake.getSegments();

      // Head should be first segment
      expect(segments[0].x).toBe(head.x);
      expect(segments[0].y).toBe(head.y);
    });
  });
});
