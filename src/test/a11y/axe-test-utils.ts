import { AxeBuilder } from "@axe-core/playwright";
import { expect } from "@playwright/test";

export async function runA11yTest(page: any, context?: string) {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);

  if (accessibilityScanResults.violations.length > 0) {
    console.log(
      `A11y violations for ${context || "page"}:`,
      accessibilityScanResults.violations,
    );
  }
}

export async function runA11yTestWithOptions(
  page: any,
  options: {
    include?: string[];
    exclude?: string[];
    context?: string;
  },
) {
  const builder = new AxeBuilder({ page }).withTags([
    "wcag2a",
    "wcag2aa",
    "wcag21a",
    "wcag21aa",
  ]);

  if (options.include) {
    builder.include(options.include);
  }

  if (options.exclude) {
    builder.exclude(options.exclude);
  }

  const accessibilityScanResults = await builder.analyze();

  expect(accessibilityScanResults.violations).toEqual([]);

  if (accessibilityScanResults.violations.length > 0) {
    console.log(
      `A11y violations for ${options.context || "page"}:`,
      accessibilityScanResults.violations,
    );
  }
}
