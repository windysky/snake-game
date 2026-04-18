// @MX:NOTE: Renderer - Canvas 2D rendering with integer coordinates
// @MX:SPEC: SPEC-GAME-001

import type { Position } from "./Snake.ts";

/**
 * Renderer - Canvas 2D rendering system
 *
 * Manages:
 * - Canvas clearing and redrawing
 * - Snake and food rendering
 * - Grid overlay drawing
 * - Integer coordinate enforcement
 *
 * REQ-GAME-004: Use integer coordinates for canvas operations
 * REQ-GAME-043: Batch similar draw operations for performance
 *
 * @MX:NOTE - Simple renderer with single responsibility for visual output
 */
export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2d context from canvas");
    }
    this.ctx = context;
  }

  /**
   * Get the canvas context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Get canvas width
   */
  getCanvasWidth(): number {
    return this.canvas.width;
  }

  /**
   * Get canvas height
   */
  getCanvasHeight(): number {
    return this.canvas.height;
  }

  /**
   * Clear the entire canvas
   * REQ-GAME-004: Use integer coordinates
   */
  clear(): void {
    const x = 0;
    const y = 0;
    const w = Math.floor(this.canvas.width);
    const h = Math.floor(this.canvas.height);
    this.ctx.clearRect(x, y, w, h);
  }

  /**
   * Draw snake segments with rounded corners and head eyes
   * REQ-GAME-004: Use integer coordinates
   * REQ-GAME-043: Batch draw operations
   */
  drawSnake(segments: Position[], color: string, cellSize = 20): void {
    const radius = Math.max(1, cellSize * 0.2);
    for (let i = segments.length - 1; i >= 0; i--) {
      const x = Math.floor(segments[i].x);
      const y = Math.floor(segments[i].y);

      this.ctx.beginPath();
      this.ctx.roundRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1, radius);
      this.ctx.fillStyle = i === 0 ? "#22c55e" : color;
      this.ctx.fill();

      if (i === 0) {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.beginPath();
        this.ctx.arc(x + cellSize * 0.35, y + cellSize * 0.4, 2, 0, Math.PI * 2);
        this.ctx.arc(x + cellSize * 0.65, y + cellSize * 0.4, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  /**
   * Draw food as circle with pulse animation
   * REQ-GAME-004: Use integer coordinates
   */
  drawFood(position: Position, color: string, cellSize = 20, pulsePhase = 0): void {
    const x = Math.floor(position.x);
    const y = Math.floor(position.y);
    const scale = 1 + Math.sin(pulsePhase) * 0.15;
    const radius = (cellSize * scale) / 2;
    const cx = x + cellSize / 2;
    const cy = y + cellSize / 2;

    this.ctx.beginPath();
    this.ctx.arc(Math.floor(cx), Math.floor(cy), Math.max(1, Math.floor(radius)), 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  drawScorePopup(x: number, y: number, text: string, alpha: number): void {
    if (alpha <= 0) return;
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = "#fbbf24";
    this.ctx.font = "bold 16px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(text, Math.floor(x), Math.floor(y));
    this.ctx.restore();
  }

  /**
   * Draw text
   * REQ-GAME-004: Use integer coordinates
   */
  drawText(text: string, x: number, y: number, color: string, fontSize = 24): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `${fontSize}px sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    const alignedX = Math.floor(x);
    const alignedY = Math.floor(y);
    this.ctx.fillText(text, alignedX, alignedY);
  }

  /**
   * Draw grid overlay
   * REQ-GAME-004: Use integer coordinates
   * REQ-GAME-041: Visual grid overlay for player orientation
   */
  drawGrid(cellSize: number, color: string): void {
    this.ctx.fillStyle = color;
    const width = Math.floor(this.canvas.width);
    const height = Math.floor(this.canvas.height);

    // Draw vertical lines
    for (let x = 0; x < width; x += cellSize) {
      this.ctx.fillRect(Math.floor(x), 0, 1, height);
    }

    // Draw horizontal lines
    for (let y = 0; y < height; y += cellSize) {
      this.ctx.fillRect(0, Math.floor(y), width, 1);
    }
  }

  /**
   * Draw rectangle (utility method)
   * REQ-GAME-004: Use integer coordinates
   */
  drawRect(x: number, y: number, width: number, height: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), width, height);
  }

  /**
   * Draw filled rectangle with opacity
   */
  drawRectAlpha(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    alpha: number,
  ): void {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), width, height);
    this.ctx.restore();
  }
}
