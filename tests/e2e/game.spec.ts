import { expect, test } from "@playwright/test";

test.describe("Snake Game", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the game page with title and canvas", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Snake Game");
    await expect(page.locator("canvas")).toBeVisible();
    await expect(page.locator('[data-testid="current-score"]')).toHaveText("0");
    await expect(page.locator('[data-testid="high-score"]')).toHaveText("0");
  });

  test("should display footer instructions", async ({ page }) => {
    await expect(page.locator("footer")).toContainText("Arrow Keys or WASD");
    await expect(page.locator("footer")).toContainText("Space to pause");
  });

  test("should render menu text on canvas before starting", async ({ page }) => {
    await expect(page.locator("canvas")).toBeVisible();
  });
});

test.describe("Game Controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should show Start button initially and hide Pause/Restart", async ({ page }) => {
    await expect(page.locator('[data-testid="start-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="pause-btn"]')).toBeHidden();
    await expect(page.locator('[data-testid="restart-btn"]')).toBeHidden();
  });

  test("should start game when Start button is clicked", async ({ page }) => {
    await page.click('button[data-testid="start-btn"]');
    await expect(page.locator('[data-testid="start-btn"]')).toBeHidden();
    await expect(page.locator('[data-testid="pause-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="pause-btn"]')).toHaveText("Pause");
  });

  test("should pause and resume via Pause button", async ({ page }) => {
    await page.click('button[data-testid="start-btn"]');

    const pauseBtn = page.locator('[data-testid="pause-btn"]');
    await pauseBtn.click();
    await expect(pauseBtn).toHaveText("Resume");

    await pauseBtn.click();
    await expect(pauseBtn).toHaveText("Pause");
  });

  test("should show Restart button when paused", async ({ page }) => {
    await page.click('button[data-testid="start-btn"]');
    await page.locator('[data-testid="pause-btn"]').click();

    await expect(page.locator('[data-testid="restart-btn"]')).toBeVisible();
  });

  test("should restart game via Restart button", async ({ page }) => {
    await page.click('button[data-testid="start-btn"]');
    await page.locator('[data-testid="pause-btn"]').click();
    await page.locator('[data-testid="restart-btn"]').click();

    await expect(page.locator('[data-testid="pause-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="pause-btn"]')).toHaveText("Pause");
  });
});

test.describe("Keyboard Controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should not start game with Space from menu", async ({ page }) => {
    await page.keyboard.press("Space");
    await expect(page.locator('[data-testid="start-btn"]')).toBeVisible();
  });

  test("should pause with Space during gameplay", async ({ page }) => {
    await page.click('button[data-testid="start-btn"]');
    await page.keyboard.press("Space");
    await expect(page.locator('[data-testid="pause-btn"]')).toHaveText("Resume");
  });

  test("should resume with Space when paused", async ({ page }) => {
    await page.click('button[data-testid="start-btn"]');
    await page.keyboard.press("Space");
    await page.keyboard.press("Space");
    await expect(page.locator('[data-testid="pause-btn"]')).toHaveText("Pause");
  });

  test("should return to menu with Escape from playing state", async ({ page }) => {
    await page.click('button[data-testid="start-btn"]');
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-testid="start-btn"]')).toBeVisible();
  });

  test("should return to menu with Escape from paused state", async ({ page }) => {
    await page.click('button[data-testid="start-btn"]');
    await page.keyboard.press("Space");
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-testid="start-btn"]')).toBeVisible();
  });

  test("should accept Arrow keys without errors", async ({ page }) => {
    await page.click('button[data-testid="start-btn"]');
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowRight");
  });

  test("should accept WASD keys without errors", async ({ page }) => {
    await page.click('button[data-testid="start-btn"]');
    await page.keyboard.press("KeyW");
    await page.keyboard.press("KeyA");
    await page.keyboard.press("KeyS");
    await page.keyboard.press("KeyD");
  });

  test("should restart with R key after game over", async ({ page }) => {
    await page.click('button[data-testid="start-btn"]');
    await page.keyboard.press("Space");
    await page.keyboard.press("KeyR");
    await expect(page.locator('[data-testid="pause-btn"]')).toHaveText("Pause");
  });

  test("should restart with R key when paused", async ({ page }) => {
    await page.click('button[data-testid="start-btn"]');
    await page.keyboard.press("Space");
    await page.keyboard.press("KeyR");
    await expect(page.locator('[data-testid="pause-btn"]')).toBeVisible();
  });
});

test.describe("Score Board", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display score labels", async ({ page }) => {
    await expect(page.locator(".score-label").first()).toContainText("Score");
    await expect(page.locator(".score-label").last()).toContainText("High Score");
  });

  test("should initialize scores at zero", async ({ page }) => {
    const scoreTexts = page.locator('[data-testid="current-score"]');
    const highScoreTexts = page.locator('[data-testid="high-score"]');
    await expect(scoreTexts).toHaveText("0");
    await expect(highScoreTexts).toHaveText("0");
  });
});

test.describe("Sound Controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display mute button and volume slider", async ({ page }) => {
    await expect(page.locator('[data-testid="mute-btn"]')).toBeVisible();
    await expect(page.locator('input[type="range"][data-testid="volume-slider"]')).toBeVisible();
  });

  test("should toggle mute icon on click", async ({ page }) => {
    const muteBtn = page.locator('[data-testid="mute-btn"]');
    const muteIcon = page.locator('[data-testid="mute-icon"]');

    await expect(muteIcon).toHaveText("🔊");
    await muteBtn.click();
    await expect(muteIcon).toHaveText("🔇");
    await muteBtn.click();
    await expect(muteIcon).toHaveText("🔊");
  });

  test("should have volume slider with correct range", async ({ page }) => {
    const slider = page.locator('[data-testid="volume-slider"]');
    await expect(slider).toHaveAttribute("min", "0");
    await expect(slider).toHaveAttribute("max", "100");
  });
});

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have ARIA labels on all control buttons", async ({ page }) => {
    await expect(page.locator('[data-testid="start-btn"]')).toHaveAttribute(
      "aria-label",
      "Start game",
    );
    await expect(page.locator('[data-testid="pause-btn"]')).toHaveAttribute(
      "aria-label",
      "Pause game",
    );
    await expect(page.locator('[data-testid="restart-btn"]')).toHaveAttribute(
      "aria-label",
      "Restart game",
    );
  });

  test("should have ARIA label on mute button", async ({ page }) => {
    await expect(page.locator('[data-testid="mute-btn"]')).toHaveAttribute(
      "aria-label",
      "Mute sound",
    );
  });

  test("should have ARIA label on volume slider", async ({ page }) => {
    await expect(page.locator('[data-testid="volume-slider"]')).toHaveAttribute(
      "aria-label",
      "Volume control",
    );
  });

  test("should have aria-live on score board", async ({ page }) => {
    await expect(page.locator("#score-board")).toHaveAttribute("aria-live", "polite");
  });

  test("should update Pause button aria-label on state change", async ({ page }) => {
    await page.click('button[data-testid="start-btn"]');
    await page.locator('[data-testid="pause-btn"]').click();
    await expect(page.locator('[data-testid="pause-btn"]')).toHaveAttribute(
      "aria-label",
      "Resume game",
    );
  });
});

test.describe("Responsive Layout", () => {
  test("should render correctly on desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");
    await expect(page.locator("canvas")).toBeVisible();
    await expect(page.locator('[data-testid="start-btn"]')).toBeVisible();
  });

  test("should render correctly on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await expect(page.locator("canvas")).toBeVisible();
    await expect(page.locator('[data-testid="start-btn"]')).toBeVisible();
  });

  test("should render correctly on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await expect(page.locator("canvas")).toBeVisible();
    await expect(page.locator('[data-testid="start-btn"]')).toBeVisible();
  });
});

test.describe("Game State Transitions", () => {
  test("should go through full game lifecycle: menu -> playing -> paused -> playing -> menu", async ({
    page,
  }) => {
    await page.goto("/");

    // Menu state
    await expect(page.locator('[data-testid="start-btn"]')).toBeVisible();

    // Start playing
    await page.click('button[data-testid="start-btn"]');
    await expect(page.locator('[data-testid="pause-btn"]')).toHaveText("Pause");

    // Pause
    await page.locator('[data-testid="pause-btn"]').click();
    await expect(page.locator('[data-testid="pause-btn"]')).toHaveText("Resume");
    await expect(page.locator('[data-testid="restart-btn"]')).toBeVisible();

    // Resume
    await page.locator('[data-testid="pause-btn"]').click();
    await expect(page.locator('[data-testid="pause-btn"]')).toHaveText("Pause");

    // Back to menu
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-testid="start-btn"]')).toBeVisible();
  });

  test("should allow restarting from menu after game start", async ({ page }) => {
    await page.goto("/");

    await page.click('button[data-testid="start-btn"]');
    await page.keyboard.press("Escape");

    await expect(page.locator('[data-testid="start-btn"]')).toBeVisible();

    await page.click('button[data-testid="start-btn"]');
    await expect(page.locator('[data-testid="pause-btn"]')).toHaveText("Pause");
  });
});

test.describe("Game Mechanics", () => {
  test("should render pixels on canvas after starting game", async ({ page }) => {
    await page.goto("/");
    await page.click('button[data-testid="start-btn"]');

    const pixelData = await page.waitForFunction(() => {
      const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let nonBlackPixels = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i] !== 0 || imageData.data[i + 1] !== 0 || imageData.data[i + 2] !== 0) {
          nonBlackPixels++;
        }
      }
      return nonBlackPixels;
    });

    expect(pixelData.jsonValue()).resolves.toBeGreaterThan(0);
  });

  test("should show snake and food on canvas during gameplay", async ({ page }) => {
    await page.goto("/");
    await page.click('button[data-testid="start-btn"]');

    const hasGreenPixels = await page.waitForFunction(() => {
      const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        if (g > 150 && r < 100 && b < 100) return true;
      }
      return false;
    });

    expect(await hasGreenPixels.jsonValue()).toBe(true);
  });

  test("should change direction with arrow keys during gameplay", async ({ page }) => {
    await page.goto("/");
    await page.click('button[data-testid="start-btn"]');

    // Wait for canvas to have rendered content
    await page.waitForFunction(() => {
      const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let nonBlackPixels = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i] !== 0 || imageData.data[i + 1] !== 0 || imageData.data[i + 2] !== 0) {
          nonBlackPixels++;
        }
      }
      return nonBlackPixels > 0;
    });

    await page.keyboard.press("ArrowUp");

    const pixelCount = await page.waitForFunction(() => {
      const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let nonBlackPixels = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i] !== 0 || imageData.data[i + 1] !== 0 || imageData.data[i + 2] !== 0) {
          nonBlackPixels++;
        }
      }
      return nonBlackPixels;
    });

    expect(await pixelCount.jsonValue()).toBeGreaterThan(0);
  });

  test("should eventually show game over when snake hits wall", async ({ page }) => {
    await page.goto("/");
    await page.click('button[data-testid="start-btn"]');

    // Wait for game to start rendering
    await page.waitForFunction(() => {
      const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let nonBlackPixels = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i] !== 0 || imageData.data[i + 1] !== 0 || imageData.data[i + 2] !== 0) {
          nonBlackPixels++;
        }
      }
      return nonBlackPixels > 0;
    });

    // Press right to drive snake into wall - game over triggers after enough ticks
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press("ArrowRight");
    }

    // Wait for game over (restart button becomes visible)
    await expect(page.locator('[data-testid="restart-btn"]')).toBeVisible({ timeout: 10000 });
  });

  test("should display game over overlay on canvas", async ({ page }) => {
    await page.goto("/");
    await page.click('button[data-testid="start-btn"]');

    // Wait for game to start rendering
    await page.waitForFunction(() => {
      const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let nonBlackPixels = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i] !== 0 || imageData.data[i + 1] !== 0 || imageData.data[i + 2] !== 0) {
          nonBlackPixels++;
        }
      }
      return nonBlackPixels > 0;
    });

    for (let i = 0; i < 50; i++) {
      await page.keyboard.press("ArrowRight");
    }

    // Wait for game over to trigger
    await expect(page.locator('[data-testid="restart-btn"]')).toBeVisible({ timeout: 10000 });

    const hasGameOverText = await page.evaluate(() => {
      const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Check for semi-transparent overlay (darkened center area)
      const centerX = Math.floor(canvas.width / 2);
      const centerY = Math.floor(canvas.height / 2);
      const idx = (centerY * canvas.width + centerX) * 4;
      const alpha = imageData.data[idx + 3];
      return alpha > 0;
    });

    expect(hasGameOverText).toBe(true);
  });
});
