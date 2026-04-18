import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import { SoundControls } from "../../src/ui/SoundControls.ts";

describe("SoundControls", () => {
  let window: Window;
  let controls: SoundControls;

  beforeEach(() => {
    window = new Window();
    globalThis.document = window.document as unknown as Document;
  });

  afterEach(() => {
    const element = document.getElementById("sound-controls");
    if (element) {
      element.remove();
    }
    window.happyDOM.cancelAsync();
  });

  describe("initialization", () => {
    it("should initialize with default volume", () => {
      controls = new SoundControls();

      expect(controls.getVolume()).toBe(50);
      expect(controls.isSoundMuted()).toBe(false);

      const slider = document.querySelector('[data-testid="volume-slider"]') as HTMLInputElement;
      expect(slider.value).toBe("50");
    });

    it("should initialize with custom default volume", () => {
      controls = new SoundControls({ defaultVolume: 75 });

      expect(controls.getVolume()).toBe(75);
    });

    it("should show unmuted icon initially", () => {
      controls = new SoundControls();

      const icon = document.querySelector('[data-testid="mute-icon"]');
      expect(icon?.textContent).toBe("🔊");
    });

    it("should have proper ARIA labels", () => {
      controls = new SoundControls();

      const muteBtn = document.querySelector('[data-testid="mute-btn"]');
      const slider = document.querySelector('[data-testid="volume-slider"]');

      expect(muteBtn?.getAttribute("aria-label")).toBe("Mute sound");
      expect(slider?.getAttribute("aria-label")).toBe("Volume control");
    });

    it("should create default element if container does not exist", () => {
      controls = new SoundControls({ containerId: "custom-sound-controls" });
      const element = document.getElementById("custom-sound-controls");

      expect(element).toBeTruthy();
      expect(element?.getAttribute("data-role")).toBe("sound-controls");
    });
  });

  describe("volume slider", () => {
    beforeEach(() => {
      controls = new SoundControls({ defaultVolume: 50 });
    });

    it("should update volume value on slider change", () => {
      const slider = document.querySelector('[data-testid="volume-slider"]') as HTMLInputElement;

      slider.value = "75";
      slider.dispatchEvent(new Event("input"));

      expect(controls.getVolume()).toBe(75);
    });

    it("should trigger callback on volume change", () => {
      let newVolume = -1;
      controls = new SoundControls(
        {},
        {
          onVolumeChange: (volume) => {
            newVolume = volume;
          },
        },
      );

      const slider = document.querySelector('[data-testid="volume-slider"]') as HTMLInputElement;
      slider.value = "80";
      slider.dispatchEvent(new Event("input"));

      expect(newVolume).toBe(80);
    });

    it("should respect min and max bounds", () => {
      const slider = document.querySelector('[data-testid="volume-slider"]') as HTMLInputElement;

      expect(slider.min).toBe("0");
      expect(slider.max).toBe("100");
    });
  });

  describe("mute toggle", () => {
    beforeEach(() => {
      controls = new SoundControls({ defaultVolume: 50 });
    });

    it("should toggle mute state on button click", () => {
      const muteBtn = document.querySelector('[data-testid="mute-btn"]') as HTMLButtonElement;

      muteBtn.click();

      expect(controls.isSoundMuted()).toBe(true);
      expect(controls.getVolume()).toBe(0);

      const icon = document.querySelector('[data-testid="mute-icon"]');
      expect(icon?.textContent).toBe("🔇");
      expect(muteBtn.getAttribute("aria-label")).toBe("Unmute sound");

      muteBtn.click();

      expect(controls.isSoundMuted()).toBe(false);
      expect(controls.getVolume()).toBe(50);

      expect(icon?.textContent).toBe("🔊");
      expect(muteBtn.getAttribute("aria-label")).toBe("Mute sound");
    });

    it("should trigger callback on mute toggle", () => {
      const muteStates: boolean[] = [];
      controls = new SoundControls(
        {},
        {
          onMuteToggle: (muted) => {
            muteStates.push(muted);
          },
        },
      );

      const muteBtn = document.querySelector('[data-testid="mute-btn"]') as HTMLButtonElement;

      muteBtn.click();
      muteBtn.click();

      expect(muteStates).toEqual([true, false]);
    });

    it("should show muted icon when muted", () => {
      controls.setMuted(true);

      const icon = document.querySelector('[data-testid="mute-icon"]');
      expect(icon?.textContent).toBe("🔇");
    });

    it("should show unmuted icon when unmuted", () => {
      controls.setMuted(true);
      controls.setMuted(false);

      const icon = document.querySelector('[data-testid="mute-icon"]');
      expect(icon?.textContent).toBe("🔊");
    });
  });

  describe("volume and mute interaction", () => {
    beforeEach(() => {
      controls = new SoundControls({ defaultVolume: 50 });
    });

    it("should show muted icon when volume is 0", () => {
      const slider = document.querySelector('[data-testid="volume-slider"]') as HTMLInputElement;

      slider.value = "0";
      slider.dispatchEvent(new Event("input"));

      const icon = document.querySelector('[data-testid="mute-icon"]');
      expect(icon?.textContent).toBe("🔇");
    });

    it("should restore volume when unmuting", () => {
      const slider = document.querySelector('[data-testid="volume-slider"]') as HTMLInputElement;
      const muteBtn = document.querySelector('[data-testid="mute-btn"]') as HTMLButtonElement;

      // Set volume to 75
      slider.value = "75";
      slider.dispatchEvent(new Event("input"));

      // Mute
      muteBtn.click();
      expect(controls.getVolume()).toBe(0);
      expect(controls.isSoundMuted()).toBe(true);

      // Unmute - should restore to 75
      muteBtn.click();
      expect(controls.getVolume()).toBe(75);
      expect(controls.isSoundMuted()).toBe(false);
    });

    it("should trigger both callbacks when muting", () => {
      let volumeChanged = -1;
      let muteToggled = false;

      controls = new SoundControls(
        { defaultVolume: 60 },
        {
          onVolumeChange: (volume) => {
            volumeChanged = volume;
          },
          onMuteToggle: (_muted) => {
            muteToggled = true;
          },
        },
      );

      const muteBtn = document.querySelector('[data-testid="mute-btn"]') as HTMLButtonElement;
      muteBtn.click();

      expect(volumeChanged).toBe(0);
      expect(muteToggled).toBe(true);
    });

    it("should trigger both callbacks when unmuting", () => {
      let volumeChanged = -1;
      let muteToggled = false;

      controls = new SoundControls(
        { defaultVolume: 60 },
        {
          onVolumeChange: (volume) => {
            volumeChanged = volume;
          },
          onMuteToggle: (_muted) => {
            muteToggled = true;
          },
        },
      );

      const muteBtn = document.querySelector('[data-testid="mute-btn"]') as HTMLButtonElement;

      // Mute then unmute
      muteBtn.click();
      volumeChanged = -1;
      muteToggled = false;
      muteBtn.click();

      expect(volumeChanged).toBe(60);
      expect(muteToggled).toBe(true);
    });
  });

  describe("setMuted method", () => {
    beforeEach(() => {
      controls = new SoundControls({ defaultVolume: 50 });
    });

    it("should set muted state to true", () => {
      controls.setMuted(true);

      expect(controls.isSoundMuted()).toBe(true);
      expect(controls.getVolume()).toBe(0);
    });

    it("should set muted state to false", () => {
      controls.setMuted(true);
      controls.setMuted(false);

      expect(controls.isSoundMuted()).toBe(false);
      expect(controls.getVolume()).toBe(50);
    });

    it("should not toggle if already in target state", () => {
      controls.setMuted(true);
      controls.setMuted(true); // Should not cause issues

      expect(controls.isSoundMuted()).toBe(true);
    });
  });
});
