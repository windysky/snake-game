// @MX:ANCHOR: Snake entity - Core game entity for movement, growth, and collision
// @MX:REASON: High fan_in - used by Game for all snake-related operations, critical for gameplay
// @MX:SPEC: SPEC-GAME-001

export type Direction = "up" | "down" | "left" | "right";

export interface Position {
  x: number;
  y: number;
}

/**
 * Opposite direction mapping for 180-degree reversal prevention
 * Shared constant for use by Snake class and main.ts input handler
 */
export const OPPOSITE_DIRECTION: Readonly<Record<Direction, Direction>> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

/**
 * Check if two directions are opposite (180-degree turn)
 * @param dir1 - First direction
 * @param dir2 - Second direction
 * @returns true if directions are opposite
 */
export function isOppositeDirection(dir1: Direction, dir2: Direction): boolean {
  return OPPOSITE_DIRECTION[dir1] === dir2;
}

/**
 * Snake - Game entity representing the player-controlled snake
 *
 * Manages:
 * - Movement in 4 directions with direction queue
 * - Growth when eating food
 * - Collision detection (walls and self)
 * - 180-degree reversal prevention
 *
 * REQ-GAME-010: Arrow key direction changes
 * REQ-GAME-011: Growth on food consumption
 * REQ-GAME-012: Collision detection
 * REQ-GAME-030: No 180-degree reversal
 * REQ-GAME-034: Direction queue
 *
 * @MX:ANCHOR - Core game logic with high coordination complexity
 */
export class Snake {
  private segments: Position[];
  private direction: Direction;
  private directionQueue: Direction[];
  private canvasWidth: number;
  private canvasHeight: number;
  private cellSize: number;
  private collided: boolean;
  private initialLength: number;

  // Direction movement vectors
  private readonly directionVectors: Readonly<Record<Direction, Position>> = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  constructor(canvasWidth: number, canvasHeight: number, cellSize: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.cellSize = cellSize;
    this.initialLength = 3;
    this.collided = false;
    this.direction = "right";
    this.directionQueue = [];

    // Initialize snake at center position
    this.segments = this.createInitialSegments();
  }

  /**
   * Create initial segments at center of canvas
   * Align to grid per REQ-GAME-004
   */
  private createInitialSegments(): Position[] {
    const centerX = Math.floor(this.canvasWidth / 2 / this.cellSize) * this.cellSize;
    const centerY = Math.floor(this.canvasHeight / 2 / this.cellSize) * this.cellSize;

    const segments: Position[] = [];
    for (let i = 0; i < this.initialLength; i++) {
      segments.push({
        x: centerX - i * this.cellSize,
        y: centerY,
      });
    }
    return segments;
  }

  /**
   * Get current direction
   */
  getDirection(): Direction {
    return this.direction;
  }

  /**
   * Get all segments (head first)
   */
  getSegments(): Position[] {
    return [...this.segments];
  }

  /**
   * Get head position
   */
  getHeadPosition(): Position {
    return { ...this.segments[0] };
  }

  /**
   * Get snake length
   */
  getLength(): number {
    return this.segments.length;
  }

  /**
   * Get direction queue length (for testing)
   */
  getQueueLength(): number {
    return this.directionQueue.length;
  }

  /**
   * Set direction with queue per REQ-GAME-034
   * REQ-GAME-030: Prevent 180-degree reversal
   * REQ-GAME-015: Queue direction changes in non-playing state
   */
  setDirection(newDir: Direction): void {
    // Get the last queued direction or current direction
    const lastDir =
      this.directionQueue.length > 0
        ? this.directionQueue[this.directionQueue.length - 1]
        : this.direction;

    // Prevent 180-degree reversal per REQ-GAME-030
    if (this.isOpposite(lastDir, newDir)) {
      return;
    }

    // Add to queue, max 2 items per SPEC reference pattern
    this.directionQueue.push(newDir);
    if (this.directionQueue.length > 2) {
      this.directionQueue.shift();
    }
  }

  /**
   * Check if two directions are opposite
   */
  private isOpposite(dir1: Direction, dir2: Direction): boolean {
    return isOppositeDirection(dir1, dir2);
  }

  /**
   * Update snake state
   * REQ-GAME-010: Process direction changes
   */
  update(): void {
    if (this.collided) {
      return;
    }

    // Process queued direction changes
    if (this.directionQueue.length > 0) {
      const newDir = this.directionQueue.shift();
      if (newDir !== undefined) {
        this.direction = newDir;
      }
    }

    // Move snake
    this.move();
  }

  /**
   * Move snake in current direction
   * Public method for game loop to call
   */
  move(): void {
    if (this.collided) {
      return;
    }

    // Process queued direction changes first
    if (this.directionQueue.length > 0) {
      const newDir = this.directionQueue.shift();
      if (newDir !== undefined) {
        this.direction = newDir;
      }
    }

    const head = this.segments[0];
    const vector = this.directionVectors[this.direction];

    const newHead: Position = {
      x: Math.floor(head.x + vector.x * this.cellSize),
      y: Math.floor(head.y + vector.y * this.cellSize),
    };

    // Add new head
    this.segments.unshift(newHead);

    // Remove tail (will be kept if grow() is called)
    this.segments.pop();

    // Check collisions
    this.checkCollisions();
  }

  /**
   * Check for collisions
   * REQ-GAME-012: Wall and self collision
   */
  private checkCollisions(): void {
    const head = this.segments[0];

    // Wall collision
    if (head.x < 0 || head.x >= this.canvasWidth || head.y < 0 || head.y >= this.canvasHeight) {
      this.collided = true;
      return;
    }

    // Self collision (skip head, check all other segments)
    for (let i = 1; i < this.segments.length; i++) {
      if (head.x === this.segments[i].x && head.y === this.segments[i].y) {
        this.collided = true;
        return;
      }
    }
  }

  /**
   * Check for wall collision
   * Public method for game loop to check before rendering
   */
  checkWallCollision(): boolean {
    const head = this.segments[0];
    return head.x < 0 || head.x >= this.canvasWidth || head.y < 0 || head.y >= this.canvasHeight;
  }

  /**
   * Check for self collision
   * Public method for game loop to check before rendering
   */
  checkSelfCollision(): boolean {
    const head = this.segments[0];
    // Skip head, check all other segments
    for (let i = 1; i < this.segments.length; i++) {
      if (head.x === this.segments[i].x && head.y === this.segments[i].y) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if snake has collided
   */
  hasCollided(): boolean {
    return this.collided;
  }

  /**
   * Grow snake by one segment
   * REQ-GAME-011: Grow when eating food
   */
  grow(): void {
    const tail = this.segments[this.segments.length - 1];
    this.segments.push({ ...tail });
  }

  /**
   * Set position (for testing)
   */
  setPosition(x: number, y: number): void {
    // Align to grid
    const alignedX = Math.floor(x / this.cellSize) * this.cellSize;
    const alignedY = Math.floor(y / this.cellSize) * this.cellSize;

    this.segments[0] = { x: alignedX, y: alignedY };

    // Clear direction queue so next update uses current direction immediately
    this.directionQueue = [];
  }

  /**
   * Reset snake to initial state
   */
  reset(): void {
    this.direction = "right";
    this.directionQueue = [];
    this.collided = false;
    this.segments = this.createInitialSegments();
  }
}
