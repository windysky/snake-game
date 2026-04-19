export type SnakeColor = "green" | "blue" | "purple" | "orange" | "cyan";
export type SnakeShape = "rounded" | "square" | "diamond";

export interface GameSettings {
  snakeColor: SnakeColor;
  snakeShape: SnakeShape;
}

const DEFAULT_SETTINGS: GameSettings = {
  snakeColor: "green",
  snakeShape: "rounded",
};

const STORAGE_KEY = "snake-game-settings";

export const SNAKE_COLORS: Record<SnakeColor, string> = {
  green: "#4ade80",
  blue: "#60a5fa",
  purple: "#c084fc",
  orange: "#fb923c",
  cyan: "#22d3ee",
};

export const SNAKE_HEAD_COLORS: Record<SnakeColor, string> = {
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
  orange: "#f97316",
  cyan: "#06b6d4",
};

export class SettingsStorage {
  load(): GameSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(raw) as Partial<GameSettings>;
      return {
        snakeColor: parsed.snakeColor ?? DEFAULT_SETTINGS.snakeColor,
        snakeShape: parsed.snakeShape ?? DEFAULT_SETTINGS.snakeShape,
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  save(settings: GameSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage full or unavailable — settings won't persist
    }
  }
}
