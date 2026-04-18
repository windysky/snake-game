/**
 * ScoreStorage - Score persistence with localStorage and memory fallback
 * Implements REQ-INF-002, REQ-INF-014, REQ-INF-015, REQ-INF-022, REQ-INF-024, REQ-INF-031, REQ-INF-032, REQ-INF-041, REQ-INF-043
 */

/**
 * Interface for score history entries
 */
export interface ScoreEntry {
  score: number;
  timestamp: number;
}

/**
 * ScoreStorage handles high score and score history persistence
 * Uses localStorage with automatic fallback to memory (REQ-INF-002, REQ-INF-015)
 */
export class ScoreStorage {
  private memoryFallback: Map<string, string> = new Map();
  private readonly HIGH_SCORE_KEY = "snake_high_score";
  private readonly SCORE_HISTORY_KEY = "snake_score_history";
  private readonly MAX_HISTORY_ENTRIES = 100;

  /**
   * Get the current high score
   * @returns High score value
   */
  getHighScore(): number {
    const value = this.getItem(this.HIGH_SCORE_KEY);
    return value ? Number.parseInt(value, 10) : 0;
  }

  /**
   * Save a score and update high score if applicable (REQ-INF-014)
   * @param score The score to save
   */
  saveScore(score: number): void {
    // Ignore negative scores
    if (score < 0) {
      return;
    }

    // Update high score if current score is higher
    const currentHighScore = this.getHighScore();
    if (score > currentHighScore) {
      this.setItem(this.HIGH_SCORE_KEY, score.toString());
    }

    // Add to score history
    this.addToHistory(score);
  }

  /**
   * Get the score history
   * @returns Array of score entries with timestamps (REQ-INF-043)
   */
  getScoreHistory(): ScoreEntry[] {
    const historyJson = this.getItem(this.SCORE_HISTORY_KEY);
    if (!historyJson) {
      return [];
    }

    try {
      const history = JSON.parse(historyJson) as ScoreEntry[];
      return Array.isArray(history) ? history : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear all scores and history
   */
  clear(): void {
    this.removeItem(this.HIGH_SCORE_KEY);
    this.removeItem(this.SCORE_HISTORY_KEY);
  }

  /**
   * Add a score to the history with timestamp
   * Implements REQ-INF-041 (limit to 100 entries)
   * @param score The score to add
   */
  private addToHistory(score: number): void {
    const history = this.getScoreHistory();

    // Add new entry with timestamp
    history.push({ score, timestamp: Date.now() });

    // Prune old entries if exceeding limit (REQ-INF-022, REQ-INF-041)
    if (history.length > this.MAX_HISTORY_ENTRIES) {
      history.splice(0, history.length - this.MAX_HISTORY_ENTRIES);
    }

    this.setItem(this.SCORE_HISTORY_KEY, JSON.stringify(history));
  }

  /**
   * Get an item from localStorage or memory fallback
   * Implements REQ-INF-002, REQ-INF-015
   * Checks memory fallback first (in case setItem failed and used fallback)
   * @param key The storage key
   * @returns The stored value or null
   */
  private getItem(key: string): string | null {
    // Check memory fallback first (in case setItem previously failed)
    if (this.memoryFallback.has(key)) {
      return this.memoryFallback.get(key) || null;
    }

    try {
      return localStorage.getItem(key);
    } catch (e) {
      // Private browsing mode or localStorage unavailable
      return null;
    }
  }

  /**
   * Set an item in localStorage with memory fallback on error
   * Implements REQ-INF-022 (prune old entries on quota exceeded)
   * @param key The storage key
   * @param value The value to store
   */
  private setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Handle quota exceeded or localStorage unavailable (REQ-INF-022)
      if (this.isQuotaExceeded(e)) {
        // Prune score history to free space
        this.pruneHistory();
        try {
          localStorage.setItem(key, value);
        } catch {
          // Still failing, use memory fallback
          this.memoryFallback.set(key, value);
        }
      } else {
        // Other error, use memory fallback
        this.memoryFallback.set(key, value);
      }
    }
  }

  /**
   * Remove an item from both localStorage and memory fallback
   * @param key The storage key
   */
  private removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
    this.memoryFallback.delete(key);
  }

  /**
   * Check if an error is a quota exceeded error
   * @param error The error to check
   * @returns true if quota exceeded
   */
  private isQuotaExceeded(error: unknown): boolean {
    return (
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.code === 22 || error.code === 1014)
    );
  }

  /**
   * Prune score history to free up localStorage space
   * Implements REQ-INF-022
   */
  private pruneHistory(): void {
    const history = this.getScoreHistory();
    if (history.length > 10) {
      // Keep only the most recent 10 entries
      const pruned = history.slice(-10);
      try {
        localStorage.setItem(this.SCORE_HISTORY_KEY, JSON.stringify(pruned));
      } catch {
        // If still failing, clear history entirely
        try {
          localStorage.removeItem(this.SCORE_HISTORY_KEY);
        } catch {
          // Ignore
        }
      }
    }
  }
}
