// @MX:NOTE: Food system - Random placement and consumption detection
// @MX:SPEC: SPEC-GAME-001

import type { Position } from "./Snake.ts";

/**
 * Food - Game entity for food spawning and consumption
 *
 * Manages:
 * - Random food placement on grid
 * - Collision detection with snake
 * - Relocation avoiding occupied positions
 *
 * REQ-GAME-011: Food system with random placement and consumption
 * REQ-GAME-004: Use integer coordinates for grid alignment
 *
 * @MX:NOTE - Simple entity with single responsibility
 */
export class Food {
  private position: Position;
  private canvasWidth: number;
  private canvasHeight: number;
  private cellSize: number;

  constructor(canvasWidth: number, canvasHeight: number, cellSize: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.cellSize = cellSize;
    this.position = this.generateRandomPosition([]);
  }

  /**
   * Get current food position
   */
  getPosition(): Position {
    return { ...this.position };
  }

  /**
   * Check if given position collides with food
   * REQ-GAME-011: Detect when snake head overlaps with food
   */
  checkCollision(x: number, y: number): boolean {
    return this.position.x === x && this.position.y === y;
  }

  /**
   * Eat food and relocate to new position
   * REQ-GAME-011: Food relocates after consumption
   */
  eat(): void {
    this.position = this.generateRandomPosition([]);
  }

  /**
   * Relocate food to new random position
   * Optionally avoid occupied positions
   */
  relocate(occupiedPositions: Position[] = []): Position {
    this.position = this.generateRandomPosition(occupiedPositions);
    return this.getPosition();
  }

  /**
   * Generate random position aligned to grid
   * REQ-GAME-004: Use integer coordinates
   * Optimized: Uses rejection sampling for sparse snake, falls back to array method
   */
  private generateRandomPosition(occupiedPositions: Position[]): Position {
    const columns = Math.floor(this.canvasWidth / this.cellSize);
    const rows = Math.floor(this.canvasHeight / this.cellSize);
    const totalCells = columns * rows;
    const occupiedCount = occupiedPositions.length;

    // If board is mostly filled (> 50%), use array method for guaranteed success
    if (occupiedCount > totalCells / 2) {
      return this.generatePositionArrayMethod(occupiedPositions, columns, rows);
    }

    // Use rejection sampling for sparse snake (more efficient)
    const maxAttempts = 100;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = Math.floor(Math.random() * columns) * this.cellSize;
      const y = Math.floor(Math.random() * rows) * this.cellSize;

      const isOccupied = occupiedPositions.some((occupied) => occupied.x === x && occupied.y === y);

      if (!isOccupied) {
        return { x, y };
      }
    }

    // Fallback to array method if rejection sampling fails
    return this.generatePositionArrayMethod(occupiedPositions, columns, rows);
  }

  /**
   * Generate position using array method (guaranteed success but slower)
   */
  private generatePositionArrayMethod(
    occupiedPositions: Position[],
    columns: number,
    rows: number,
  ): Position {
    // Create list of all possible positions
    const allPositions: Position[] = [];
    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        allPositions.push({
          x: x * this.cellSize,
          y: y * this.cellSize,
        });
      }
    }

    // Filter out occupied positions
    const availablePositions = allPositions.filter(
      (pos) => !occupiedPositions.some((occupied) => occupied.x === pos.x && occupied.y === pos.y),
    );

    // If no available positions (shouldn't happen in normal gameplay),
    // return first position as fallback
    if (availablePositions.length === 0) {
      return allPositions[0];
    }

    // Select random position
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    return availablePositions[randomIndex];
  }
}
