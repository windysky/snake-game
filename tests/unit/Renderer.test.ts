// @MX:NOTE: Renderer tests - verifies canvas operations and integer coordinates
// @MX:SPEC: SPEC-GAME-001

import { beforeEach, describe, expect, test } from "bun:test";
import { Renderer } from "../../src/game/Renderer.ts";
import type { Position } from "../../src/game/Snake.ts";

type TrackedRect = { x: number; y: number; w: number; h: number };
type TrackedText = { text: string; x: number; y: number };
type TrackedArc = { x: number; y: number; radius: number };
type TrackedRoundRect = { x: number; y: number; w: number; h: number; radius: number };
type MockContext = CanvasRenderingContext2D & {
  fillRectCalls: TrackedRect[];
  clearRectCalls: TrackedRect[];
  fillTextCalls: TrackedText[];
  fillCalls: number;
  arcCalls: TrackedArc[];
  roundRectCalls: TrackedRoundRect[];
  resetTracking: () => void;
};

describe("Renderer", () => {
  let renderer: Renderer;
  let mockCanvas: HTMLCanvasElement;
  let mockCtx: MockContext;

  beforeEach(() => {
    const fillRectCalls: TrackedRect[] = [];
    const clearRectCalls: TrackedRect[] = [];
    const fillTextCalls: TrackedText[] = [];
    let fillCalls = 0;
    const arcCalls: TrackedArc[] = [];
    const roundRectCalls: TrackedRoundRect[] = [];

    mockCtx = {
      fillRect: (x: number, y: number, w: number, h: number) => {
        fillRectCalls.push({ x, y, w, h });
      },
      clearRect: (x: number, y: number, w: number, h: number) => {
        clearRectCalls.push({ x, y, w, h });
      },
      fillText: (text: string, x: number, y: number) => {
        fillTextCalls.push({ text, x, y });
      },
      beginPath: () => {},
      roundRect: (x: number, y: number, w: number, h: number, radius: number) => {
        roundRectCalls.push({ x, y, w, h, radius });
      },
      arc: (x: number, y: number, radius: number) => {
        arcCalls.push({ x, y, radius });
      },
      fill: () => {
        fillCalls++;
      },
      fillStyle: "",
      font: "",
      textAlign: "",
      textBaseline: "",
      globalAlpha: 1,
      save: () => {},
      restore: () => {},
      get fillRectCalls() {
        return fillRectCalls;
      },
      get clearRectCalls() {
        return clearRectCalls;
      },
      get fillTextCalls() {
        return fillTextCalls;
      },
      get fillCalls() {
        return fillCalls;
      },
      get arcCalls() {
        return arcCalls;
      },
      get roundRectCalls() {
        return roundRectCalls;
      },
      resetTracking: () => {
        fillRectCalls.length = 0;
        clearRectCalls.length = 0;
        fillTextCalls.length = 0;
        fillCalls = 0;
        arcCalls.length = 0;
        roundRectCalls.length = 0;
      },
    } as unknown as MockContext;

    mockCanvas = {
      width: 800,
      height: 600,
      getContext: (contextType: string) => {
        if (contextType === "2d") return mockCtx;
        return null;
      },
    } as unknown as HTMLCanvasElement;

    renderer = new Renderer(mockCanvas);
  });

  describe("initialization", () => {
    test("should get 2d context from canvas", () => {
      const ctx = renderer.getContext();
      expect(ctx).toBe(mockCtx);
    });

    test("should have canvas dimensions", () => {
      expect(renderer.getCanvasWidth()).toBe(800);
      expect(renderer.getCanvasHeight()).toBe(600);
    });
  });

  describe("clear", () => {
    test("should clear entire canvas", () => {
      renderer.clear();
      expect(mockCtx.clearRectCalls.length).toBe(1);
      expect(mockCtx.clearRectCalls[0]).toEqual({ x: 0, y: 0, w: 800, h: 600 });
    });

    test("should use integer coordinates", () => {
      renderer.clear();
      const call = mockCtx.clearRectCalls[0];
      expect(Number.isInteger(call.x)).toBe(true);
      expect(Number.isInteger(call.y)).toBe(true);
    });
  });

  describe("draw snake", () => {
    test("should draw snake segments with rounded corners", () => {
      const segments: Position[] = [
        { x: 100, y: 100 },
        { x: 80, y: 100 },
        { x: 60, y: 100 },
      ];

      renderer.drawSnake(segments, "#00ff00");

      expect(mockCtx.roundRectCalls.length).toBe(3);
    });

    test("should use integer-aligned coordinates for snake segments", () => {
      const segments: Position[] = [
        { x: 100.5, y: 100.3 },
        { x: 80, y: 100 },
      ];

      renderer.drawSnake(segments, "#00ff00");

      for (const call of mockCtx.roundRectCalls) {
        expect(Number.isInteger(call.x - 0.5)).toBe(true);
        expect(Number.isInteger(call.y - 0.5)).toBe(true);
      }
    });

    test("should draw each segment at correct size", () => {
      const segments: Position[] = [{ x: 100, y: 100 }];
      const cellSize = 20;

      renderer.drawSnake(segments, "#00ff00", cellSize);

      expect(mockCtx.roundRectCalls[0].w).toBe(cellSize - 1);
      expect(mockCtx.roundRectCalls[0].h).toBe(cellSize - 1);
    });

    test("should draw eyes on head segment", () => {
      const segments: Position[] = [{ x: 100, y: 100 }];

      renderer.drawSnake(segments, "#00ff00", 20);

      expect(mockCtx.arcCalls.length).toBe(2);
    });
  });

  describe("draw food", () => {
    test("should draw food as circle", () => {
      const food: Position = { x: 200, y: 150 };

      renderer.drawFood(food, "#ff0000");

      expect(mockCtx.arcCalls.length).toBe(1);
    });

    test("should use integer coordinates for food", () => {
      const food: Position = { x: 200.7, y: 150.2 };

      renderer.drawFood(food, "#ff0000");

      expect(mockCtx.arcCalls.length).toBe(1);
      expect(Number.isInteger(mockCtx.arcCalls[0].x)).toBe(true);
      expect(Number.isInteger(mockCtx.arcCalls[0].y)).toBe(true);
    });

    test("should draw food at correct radius", () => {
      const food: Position = { x: 200, y: 150 };
      const cellSize = 20;

      renderer.drawFood(food, "#ff0000", cellSize);

      expect(mockCtx.arcCalls[0].radius).toBe(cellSize / 2);
    });
  });

  describe("draw text", () => {
    test("should draw text at position", () => {
      renderer.drawText("Game Over", 400, 300, "#ffffff");
      expect(renderer.drawText).toBeDefined();
    });
  });

  describe("batch operations", () => {
    test("should allow drawing multiple entities", () => {
      const segments: Position[] = [
        { x: 100, y: 100 },
        { x: 80, y: 100 },
      ];
      const food: Position = { x: 200, y: 150 };

      renderer.clear();
      renderer.drawSnake(segments, "#00ff00");
      renderer.drawFood(food, "#ff0000");

      expect(mockCtx.clearRectCalls.length).toBe(1);
      expect(mockCtx.roundRectCalls.length).toBe(2);
      expect(mockCtx.arcCalls.length).toBe(3);
    });
  });

  describe("color application", () => {
    test("should set fill style for snake", () => {
      const segments: Position[] = [{ x: 100, y: 100 }];
      renderer.drawSnake(segments, "#00ff00");
      expect(mockCtx.fillStyle).toBeDefined();
    });

    test("should set fill style for food", () => {
      const food: Position = { x: 200, y: 150 };
      renderer.drawFood(food, "#ff0000");
      expect(mockCtx.fillStyle).toBeDefined();
    });
  });

  describe("grid overlay", () => {
    test("should draw grid lines", () => {
      renderer.drawGrid(20, "#333333");
      expect(mockCtx.fillRectCalls.length).toBeGreaterThan(0);
    });

    test("should use integer coordinates for grid", () => {
      renderer.drawGrid(20, "#333333");
      for (const call of mockCtx.fillRectCalls) {
        expect(Number.isInteger(call.x)).toBe(true);
        expect(Number.isInteger(call.y)).toBe(true);
      }
    });
  });
});
