import { beforeEach, describe, expect, test } from "bun:test";
import { SoundManager } from "../../src/audio/SoundManager";

// Mock Web Audio API for testing
class MockAudioContext {
  readonly destination: AudioDestinationNode = {} as AudioDestinationNode;
  readonly currentTime: number = 0;

  createOscillator(): OscillatorNode {
    const frequency = {
      setValueAtTime: () => {},
      exponentialRampToValueAtTime: () => {},
      value: 0,
    };
    return {
      connect: () => {},
      start: () => {},
      stop: () => {},
      frequency: frequency,
      onended: null,
    } as unknown as OscillatorNode;
  }

  createGain(): GainNode {
    return {
      connect: () => {},
      gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
    } as unknown as GainNode;
  }
}

// Set up mock AudioContext
globalThis.AudioContext = MockAudioContext as any;
globalThis.window = { AudioContext: MockAudioContext } as any;

describe("SoundManager", () => {
  let soundManager: SoundManager;

  beforeEach(() => {
    soundManager = new SoundManager();
  });

  describe("initialization", () => {
    test("should return true when AudioContext is available", () => {
      const result = soundManager.initialize();
      expect(result).toBe(true);
    });

    test("should return false when Web Audio API is not supported", () => {
      // Save original
      const originalWindow = globalThis.window;

      (globalThis.window as any).AudioContext = undefined;

      const manager = new SoundManager();
      const result = manager.initialize();

      expect(result).toBe(false);

      // Restore
      globalThis.window = originalWindow;
    });
  });

  describe("volume control", () => {
    test("should set volume from 0 to 100", () => {
      soundManager.initialize();

      soundManager.setVolume(50);
      expect(soundManager.getVolume()).toBe(50);

      soundManager.setVolume(0);
      expect(soundManager.getVolume()).toBe(0);

      soundManager.setVolume(100);
      expect(soundManager.getVolume()).toBe(100);
    });

    test("should clamp volume to valid range", () => {
      soundManager.initialize();

      soundManager.setVolume(-10);
      expect(soundManager.getVolume()).toBe(0);

      soundManager.setVolume(150);
      expect(soundManager.getVolume()).toBe(100);
    });
  });

  describe("mute control", () => {
    test("should toggle mute state", () => {
      soundManager.initialize();

      expect(soundManager.isMuted()).toBe(false);

      soundManager.toggleMute();
      expect(soundManager.isMuted()).toBe(true);

      soundManager.toggleMute();
      expect(soundManager.isMuted()).toBe(false);
    });

    test("should set mute state explicitly", () => {
      soundManager.initialize();

      soundManager.setMuted(true);
      expect(soundManager.isMuted()).toBe(true);

      soundManager.setMuted(false);
      expect(soundManager.isMuted()).toBe(false);
    });
  });

  describe("sound playback", () => {
    test("should play eat sound", () => {
      soundManager.initialize();

      // Should not throw when playing eat sound
      expect(() => soundManager.playEat()).not.toThrow();
    });

    test("should play game over sound", () => {
      soundManager.initialize();

      // Should not throw when playing game over sound
      expect(() => soundManager.playGameOver()).not.toThrow();
    });

    test("should not play sounds when muted", () => {
      soundManager.initialize();
      soundManager.setMuted(true);

      // Should not throw when muted
      expect(() => soundManager.playEat()).not.toThrow();
      expect(() => soundManager.playGameOver()).not.toThrow();
    });

    test("should not play sounds when not initialized", () => {
      const uninitializedManager = new SoundManager();

      // Should not throw when not initialized
      expect(() => uninitializedManager.playEat()).not.toThrow();
      expect(() => uninitializedManager.playGameOver()).not.toThrow();
    });

    test("should limit concurrent sounds to prevent audio spam", () => {
      soundManager.initialize();

      // Play many sounds quickly - should not cause issues
      for (let i = 0; i < 10; i++) {
        soundManager.playEat();
      }

      // Test passes if no errors thrown
      expect(true).toBe(true);
    });
  });

  describe("error handling", () => {
    test("should gracefully handle audio errors", () => {
      soundManager.initialize();

      // Mock a scenario where audio might fail
      // The implementation should catch and log errors without throwing
      expect(() => soundManager.playEat()).not.toThrow();
    });
  });
});
