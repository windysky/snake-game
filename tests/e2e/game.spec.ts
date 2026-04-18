import { expect, test } from "@playwright/test";

test.describe("Snake Game", () => {
  test("should load the game page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("canvas")).toBeVisible();
    await expect(page.locator('[data-testid="current-score"]')).toHaveText("0");
  });

  test("should start game when start button is clicked", async ({ page }) => {
    await page.goto("/");
    await page.click('button[data-testid="start-btn"]');
    await expect(page.locator('[data-testid="current-score"]')).toBeVisible();
  });

  test("should display game controls", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('button[data-testid="start-btn"]')).toBeVisible();
    // Pause and restart buttons are hidden initially, but exist in DOM
    await expect(page.locator('button[data-testid="pause-btn"]')).toHaveCount(1);
    await expect(page.locator('button[data-testid="restart-btn"]')).toHaveCount(1);
  });

  test("should display sound controls", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('button[data-testid="mute-btn"]')).toBeVisible();
    await expect(page.locator('input[type="range"][data-testid="volume-slider"]')).toBeVisible();
  });

  test("should display score board", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-testid="current-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="high-score"]')).toBeVisible();
  });

  test("should handle keyboard input", async ({ page }) => {
    await page.goto("/");
    // Arrow keys should work without errors
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowRight");
    // Space key for pause
    await page.keyboard.press("Space");
  });
});
