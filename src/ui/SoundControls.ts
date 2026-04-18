/**
 * SoundControls UI component
 * Provides volume slider and mute toggle for sound control
 */

export interface SoundControlsOptions {
  containerId?: string;
  defaultVolume?: number;
}

export interface SoundControlsCallbacks {
  onVolumeChange?: (volume: number) => void;
  onMuteToggle?: (muted: boolean) => void;
}

export class SoundControls {
  private readonly element: HTMLElement;
  private readonly muteBtn: HTMLButtonElement;
  private readonly muteIcon: HTMLElement;
  private readonly volumeSlider: HTMLInputElement;
  private volume: number;
  private previousVolume: number;
  private isMuted: boolean;
  private callbacks: SoundControlsCallbacks;

  constructor(options: SoundControlsOptions = {}, callbacks: SoundControlsCallbacks = {}) {
    const containerId = options.containerId || "sound-controls";
    const defaultVolume = options.defaultVolume ?? 50;
    this.volume = defaultVolume;
    this.previousVolume = defaultVolume;
    this.isMuted = false;
    this.callbacks = callbacks;

    // Get or create the controls element
    let container = document.getElementById(containerId);
    if (!container) {
      container = this.createDefaultElement(containerId, defaultVolume);
      document.body.appendChild(container);
    }

    this.element = container;

    // Get control elements
    this.muteBtn = this.element.querySelector('[data-testid="mute-btn"]')!;
    this.muteIcon = this.element.querySelector('[data-testid="mute-icon"]')!;
    this.volumeSlider = this.element.querySelector(
      '[data-testid="volume-slider"]',
    )! as HTMLInputElement;

    // Set up event listeners
    this.setupEventListeners();
  }

  private createDefaultElement(id: string, defaultVolume: number): HTMLElement {
    const container = document.createElement("div");
    container.id = id;
    container.setAttribute("data-role", "sound-controls");
    container.innerHTML = `
      <button id="btn-mute" data-testid="mute-btn" aria-label="Mute sound">
        <span data-testid="mute-icon">🔊</span>
      </button>
      <input
        id="volume-slider"
        data-testid="volume-slider"
        type="range"
        min="0"
        max="100"
        value="${defaultVolume}"
        aria-label="Volume control"
      />
    `;
    return container;
  }

  private setupEventListeners(): void {
    // Volume slider change
    this.volumeSlider.addEventListener("input", () => {
      const newVolume = Number.parseInt(this.volumeSlider.value, 10);
      this.setVolume(newVolume);
    });

    // Mute button click
    this.muteBtn.addEventListener("click", () => {
      this.toggleMute();
    });
  }

  private setVolume(volume: number): void {
    this.volume = volume;
    this.volumeSlider.value = volume.toString();

    // Update mute state based on volume
    if (volume === 0 && !this.isMuted) {
      this.isMuted = true;
      this.updateMuteIcon();
    } else if (volume > 0 && this.isMuted) {
      this.isMuted = false;
      this.updateMuteIcon();
    }

    this.callbacks.onVolumeChange?.(volume);
  }

  private toggleMute(): void {
    if (this.isMuted) {
      // Unmute - restore previous volume
      this.isMuted = false;
      this.volume = this.previousVolume;
      this.volumeSlider.value = this.volume.toString();
    } else {
      // Mute - save current volume and set to 0
      this.previousVolume = this.volume;
      this.isMuted = true;
      this.volumeSlider.value = "0";
    }

    this.updateMuteIcon();
    this.callbacks.onMuteToggle?.(this.isMuted);
    this.callbacks.onVolumeChange?.(this.isMuted ? 0 : this.volume);
  }

  private updateMuteIcon(): void {
    if (this.isMuted || this.volume === 0) {
      this.muteIcon.textContent = "🔇";
      this.muteBtn.setAttribute("aria-label", "Unmute sound");
    } else {
      this.muteIcon.textContent = "🔊";
      this.muteBtn.setAttribute("aria-label", "Mute sound");
    }
  }

  getVolume(): number {
    return this.isMuted ? 0 : this.volume;
  }

  isSoundMuted(): boolean {
    return this.isMuted;
  }

  setMuted(muted: boolean): void {
    if (muted && !this.isMuted) {
      this.toggleMute();
    } else if (!muted && this.isMuted) {
      this.toggleMute();
    }
  }
}
