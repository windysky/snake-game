import {
  type GameSettings,
  SettingsStorage,
  SNAKE_COLORS,
  type SnakeColor,
  type SnakeShape,
} from "../storage/SettingsStorage.ts";

interface SettingsPanelCallbacks {
  onSettingsChange: (settings: GameSettings) => void;
}

export class SettingsPanel {
  private storage: SettingsStorage;
  private settings: GameSettings;
  private callbacks: SettingsPanelCallbacks;
  private overlay: HTMLElement | null = null;

  constructor(_options: Record<string, unknown>, callbacks: SettingsPanelCallbacks) {
    this.storage = new SettingsStorage();
    this.settings = this.storage.load();
    this.callbacks = callbacks;
  }

  init(): void {
    const toggle = document.getElementById("settings-toggle");
    this.overlay = document.getElementById("settings-overlay");

    toggle?.addEventListener("click", () => this.open());
    document.getElementById("settings-close")?.addEventListener("click", () => this.close());

    this.overlay?.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });

    this.renderColorSwatches();
    this.renderShapeOptions();

    // Notify initial settings
    this.callbacks.onSettingsChange(this.settings);
  }

  getSettings(): GameSettings {
    return { ...this.settings };
  }

  private open(): void {
    this.overlay?.classList.add("open");
  }

  private close(): void {
    this.overlay?.classList.remove("open");
  }

  private renderColorSwatches(): void {
    const container = document.getElementById("color-swatches");
    if (!container) return;

    container.innerHTML = "";
    const colors: SnakeColor[] = ["green", "blue", "purple", "orange", "cyan"];

    for (const color of colors) {
      const swatch = document.createElement("button");
      swatch.type = "button";
      swatch.className = `color-swatch${this.settings.snakeColor === color ? " active" : ""}`;
      swatch.style.backgroundColor = SNAKE_COLORS[color];
      swatch.setAttribute("aria-label", `${color} snake color`);
      swatch.addEventListener("click", () => this.setColor(color));
      container.appendChild(swatch);
    }
  }

  private renderShapeOptions(): void {
    const container = document.getElementById("shape-options");
    if (!container) return;

    container.innerHTML = "";
    const shapes: SnakeShape[] = ["rounded", "square", "diamond"];

    for (const shape of shapes) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `shape-btn${this.settings.snakeShape === shape ? " active" : ""}`;
      btn.textContent = shape.charAt(0).toUpperCase() + shape.slice(1);
      btn.setAttribute("aria-label", `${shape} snake shape`);
      btn.addEventListener("click", () => this.setShape(shape));
      container.appendChild(btn);
    }
  }

  private setColor(color: SnakeColor): void {
    this.settings.snakeColor = color;
    this.storage.save(this.settings);
    this.renderColorSwatches();
    this.callbacks.onSettingsChange(this.settings);
  }

  private setShape(shape: SnakeShape): void {
    this.settings.snakeShape = shape;
    this.storage.save(this.settings);
    this.renderShapeOptions();
    this.callbacks.onSettingsChange(this.settings);
  }
}
