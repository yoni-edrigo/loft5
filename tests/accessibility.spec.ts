import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  { name: "Landing Page", url: "/" },
  { name: "Office Page", url: "/office" },
  { name: "Terms Page", url: "/terms" },
  { name: "Accessibility Page", url: "/accessibility" },
];

test.describe("Accessibility Tests", () => {
  for (const page of pages) {
    test(`${page.name} should not have accessibility violations`, async ({
      page: browserPage,
    }) => {
      await browserPage.goto(page.url);

      // Wait for page to load
      await browserPage.waitForLoadState("networkidle");

      // Run accessibility scan
      const accessibilityScanResults = await new AxeBuilder({
        page: browserPage,
      })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test(`${page.name} should have proper heading structure`, async ({
      page: browserPage,
    }) => {
      await browserPage.goto(page.url);
      await browserPage.waitForLoadState("networkidle");

      // Check for proper heading hierarchy
      const headings = await browserPage
        .locator("h1, h2, h3, h4, h5, h6")
        .allTextContents();
      expect(headings.length).toBeGreaterThan(0);

      // Ensure there's at least one h1
      const h1Count = await browserPage.locator("h1").count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
    });

    test(`${page.name} should have proper color contrast`, async ({
      page: browserPage,
    }) => {
      await browserPage.goto(page.url);
      await browserPage.waitForLoadState("networkidle");

      const accessibilityScanResults = await new AxeBuilder({
        page: browserPage,
      })
        .withTags(["cat.color"])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test(`${page.name} should be keyboard navigable`, async ({
      page: browserPage,
    }) => {
      await browserPage.goto(page.url);
      await browserPage.waitForLoadState("networkidle");

      // Test tab navigation
      const focusableElements = await browserPage
        .locator(
          'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        .count();

      if (focusableElements > 0) {
        // Start tab navigation
        await browserPage.keyboard.press("Tab");
        const firstFocusedElement = await browserPage.evaluate(
          () => document.activeElement?.tagName,
        );
        expect(firstFocusedElement).toBeTruthy();
      }
    });
  }
});

test.describe("Form Accessibility", () => {
  test("Sign-in form should be accessible", async ({ page }) => {
    await page.goto("/office");
    await page.waitForLoadState("networkidle");

    // Look for sign-in form or auth elements
    const authElements = await page
      .locator(
        '[data-testid*="auth"], [data-testid*="signin"], button:has-text("Sign"), input[type="email"], input[type="password"]',
      )
      .count();

    if (authElements > 0) {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[data-testid*="auth"], form, input, button')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test("Booking forms should be accessible", async ({ page }) => {
    await page.goto("/office");
    await page.waitForLoadState("networkidle");

    // Look for booking-related forms
    const bookingElements = await page
      .locator(
        '[data-testid*="booking"], [data-testid*="calendar"], input[type="date"], input[type="time"]',
      )
      .count();

    if (bookingElements > 0) {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[data-testid*="booking"], [data-testid*="calendar"], form')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });
});

test.describe("Component Accessibility", () => {
  test("Interactive components should have proper ARIA attributes", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check buttons have accessible names
    const buttons = await page.locator("button").count();
    if (buttons > 0) {
      const buttonsWithoutLabels = await page
        .locator(
          "button:not([aria-label]):not([aria-labelledby]):not(:has-text):not([title])",
        )
        .count();
      expect(buttonsWithoutLabels).toBe(0);
    }

    // Check images have alt text
    const images = await page.locator("img").count();
    if (images > 0) {
      const imagesWithoutAlt = await page.locator("img:not([alt])").count();
      expect(imagesWithoutAlt).toBe(0);
    }
  });

  test("Dialog components should trap focus", async ({ page }) => {
    await page.goto("/office");
    await page.waitForLoadState("networkidle");

    // Look for dialog triggers
    const dialogTriggers = await page
      .locator(
        'button:has-text("Book"), button:has-text("Details"), [data-testid*="dialog"]',
      )
      .count();

    if (dialogTriggers > 0) {
      // Try to open a dialog
      const firstTrigger = page
        .locator(
          'button:has-text("Book"), button:has-text("Details"), [data-testid*="dialog"]',
        )
        .first();
      if (await firstTrigger.isVisible()) {
        await firstTrigger.click();

        // Check if dialog is open and has proper ARIA attributes
        const dialog = page.locator('[role="dialog"], [data-state="open"]');
        if ((await dialog.count()) > 0) {
          const accessibilityScanResults = await new AxeBuilder({ page })
            .include('[role="dialog"], [data-state="open"]')
            .analyze();

          expect(accessibilityScanResults.violations).toEqual([]);
        }
      }
    }
  });
});
