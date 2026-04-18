/**
 * SoundManager - Audio playback for game sound effects
 * Uses Web Audio API with graceful degradation
 *
 * @MX:NOTE Procedural sound generation using oscillators
 * No external sound files needed
 */

// Type for Web Audio API context
type AudioContextType = typeof AudioContext;

/**
 * SoundManager handles all game audio playback
 * Implements REQ-INF-001, REQ-INF-003, REQ-INF-010 through REQ-INF-013, REQ-INF-020, REQ-INF-021, REQ-INF-023, REQ-INF-030, REQ-INF-032, REQ-INF-033, REQ-INF-040, REQ-INF-042
 */
export class SoundManager {
  private context: AudioContext | null = null;
  private volume = 50;
  private muted = false;
  private activeSounds = 0;
  private readonly MAX_CONCURRENT_SOUNDS = 5;

  /**
   * Initialize the AudioContext (requires user gesture per REQ-INF-001)
   * @returns true if initialization successful, false otherwise (REQ-INF-021)
   */
  initialize(): boolean {
    // Check for Web Audio API support (REQ-INF-020)
    const AudioContextConstructor: AudioContextType | undefined =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: AudioContextType }).webkitAudioContext;

    if (!AudioContextConstructor) {
      console.warn("Web Audio API not supported");
      return false;
    }

    try {
      this.context = new AudioContextConstructor();
      // Resume if suspended (browser autoplay policy)
      if (this.context.state === "suspended") {
        this.context.resume();
      }
      return true;
    } catch (e) {
      console.error("AudioContext initialization failed:", e);
      return false;
    }
  }

  /**
   * Play a sound effect
   * @param soundGenerator Function that creates and configures the sound
   */
  private playSound(soundGenerator: (context: AudioContext) => void): void {
    // Skip if muted (REQ-INF-023)
    if (this.muted) {
      return;
    }

    // Skip if not initialized
    if (!this.context) {
      return;
    }

    // Limit concurrent sounds (REQ-INF-033)
    if (this.activeSounds >= this.MAX_CONCURRENT_SOUNDS) {
      return;
    }

    // Wrap in try-catch for error handling (REQ-INF-003)
    try {
      soundGenerator(this.context);
    } catch (e) {
      console.error("Sound playback error:", e);
    }
  }

  /**
   * Generate eat sound - short high-frequency beep
   * Implements REQ-INF-010
   */
  playEat(): void {
    this.playSound((context) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = 600;
      oscillator.type = "sine";

      const volume = this.getGainValue();
      gainNode.gain.setValueAtTime(volume, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.1);

      this.activeSounds++;
      oscillator.onended = () => {
        this.activeSounds--;
      };
    });
  }

  /**
   * Generate game over sound - descending tone
   * Implements REQ-INF-011
   */
  playGameOver(): void {
    this.playSound((context) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(400, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, context.currentTime + 0.5);
      oscillator.type = "sawtooth";

      const volume = this.getGainValue();
      gainNode.gain.setValueAtTime(volume, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);

      this.activeSounds++;
      oscillator.onended = () => {
        this.activeSounds--;
      };
    });
  }

  /**
   * Set volume level (REQ-INF-012, REQ-INF-042)
   * @param level Volume level from 0 to 100
   */
  setVolume(level: number): void {
    // Clamp to valid range
    this.volume = Math.max(0, Math.min(100, level));
  }

  /**
   * Get current volume level
   * @returns Volume level from 0 to 100
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Toggle mute state (REQ-INF-013)
   */
  toggleMute(): void {
    this.muted = !this.muted;
  }

  /**
   * Set mute state explicitly
   * @param muted true to mute, false to unmute
   */
  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  /**
   * Check if audio is muted
   * @returns true if muted
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Convert volume (0-100) to gain value (0-1)
   * @returns Gain value for Web Audio API
   */
  private getGainValue(): number {
    return this.volume / 100;
  }
}
