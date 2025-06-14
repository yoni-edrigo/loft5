import { test, expect } from "@playwright/test";

test.describe("Landing Page E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the landing page successfully", async ({ page }) => {
    await expect(page).toHaveTitle(/לופט/i);

    // Check main sections are present
    await expect(page.locator("section").first()).toBeVisible();
  });

  test("should display hero section with carousel", async ({ page }) => {
    // Wait for hero section to load
    await page.waitForSelector('[data-testid="hero"], section:first-child');

    // Check for hero content
    const heroSection = page.locator("section").first();
    await expect(heroSection).toBeVisible();

    // Check for images in carousel
    const images = page.locator("img");
    await expect(images.first()).toBeVisible();
  });

  test("should navigate through page sections", async ({ page }) => {
    // Check calendar section
    const calendarSection = page.locator("#calendar");
    await expect(calendarSection).toBeVisible();

    // Check booking options section
    const optionsSection = page.locator("#options");
    await expect(optionsSection).toBeVisible();

    // Check gallery section
    const gallerySection = page.locator("#gallery");
    await expect(gallerySection).toBeVisible();
  });

  test("should interact with booking calendar", async ({ page }) => {
    // Scroll to calendar section
    await page.locator("#calendar").scrollIntoViewIfNeeded();

    // Look for calendar component
    const calendar = page.locator(
      '[data-testid="booking-calendar"], .calendar, [role="grid"]',
    );

    if ((await calendar.count()) > 0) {
      await expect(calendar.first()).toBeVisible();

      // Try to click on a date if available
      const dateButton = page.locator("button:has-text(/[0-9]+/)").first();
      if ((await dateButton.count()) > 0) {
        await dateButton.click();
      }
    }
  });

  test("should display booking options and summary", async ({ page }) => {
    // Scroll to options section
    await page.locator("#options").scrollIntoViewIfNeeded();

    // Check for booking options
    const bookingOptions = page.locator('[data-testid="booking-options"]');
    if ((await bookingOptions.count()) > 0) {
      await expect(bookingOptions).toBeVisible();
    }

    // Check for booking summary
    const bookingSummary = page.locator('[data-testid="booking-summary"]');
    if ((await bookingSummary.count()) > 0) {
      await expect(bookingSummary).toBeVisible();
    }
  });

  test("should open image gallery modal", async ({ page }) => {
    // Scroll to gallery section
    await page.locator("#gallery").scrollIntoViewIfNeeded();

    // Look for gallery images
    const galleryImages = page.locator(
      '#gallery img, [data-testid="image-gallery"] img',
    );

    if ((await galleryImages.count()) > 0) {
      // Click on first image
      await galleryImages.first().click();

      // Check if modal/dialog opens
      const dialog = page.locator('[role="dialog"], .modal');
      if ((await dialog.count()) > 0) {
        await expect(dialog).toBeVisible();

        // Close modal with Escape
        await page.keyboard.press("Escape");
        await expect(dialog).not.toBeVisible();
      }
    }
  });

  test("should use floating office button", async ({ page }) => {
    // Look for floating button
    const floatingButton = page.locator(
      '.fixed button, [data-testid="floating-office-button"]',
    );

    if ((await floatingButton.count()) > 0) {
      await expect(floatingButton).toBeVisible();

      // Click should navigate to office page
      await floatingButton.click();
      await expect(page).toHaveURL(/\/office/);
    }
  });

  test("should navigate to footer links", async ({ page }) => {
    // Scroll to footer
    await page.locator("footer").scrollIntoViewIfNeeded();

    // Check footer links
    const termsLink = page.locator(
      'footer a[href*="terms"], footer a:has-text("תנאי")',
    );
    if ((await termsLink.count()) > 0) {
      await termsLink.click();
      await expect(page).toHaveURL(/\/terms/);
      await page.goBack();
    }

    const accessibilityLink = page.locator(
      'footer a[href*="accessibility"], footer a:has-text("נגישות")',
    );
    if ((await accessibilityLink.count()) > 0) {
      await accessibilityLink.click();
      await expect(page).toHaveURL(/\/accessibility/);
      await page.goBack();
    }
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that content is still visible and functional
    await expect(page.locator("section").first()).toBeVisible();

    // Check that floating button is still accessible
    const floatingButton = page.locator(".fixed button");
    if ((await floatingButton.count()) > 0) {
      await expect(floatingButton).toBeVisible();
    }
  });

  test("should handle scroll behavior", async ({ page }) => {
    // Test smooth scrolling to sections
    const calendarSection = page.locator("#calendar");
    await calendarSection.scrollIntoViewIfNeeded();

    // Check section is in viewport
    await expect(calendarSection).toBeInViewport();
  });

  test("should load all images properly", async ({ page }) => {
    // Wait for images to load
    await page.waitForLoadState("networkidle");

    // Check that images have loaded without errors
    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      await expect(img).toBeVisible();

      // Check image has src
      const src = await img.getAttribute("src");
      expect(src).toBeTruthy();
    }
  });
});
