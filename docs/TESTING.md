# Testing Guide

## Overview

This project includes comprehensive testing setup with unit tests, integration tests, end-to-end tests, and accessibility testing.

## Testing Stack

- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Accessibility**: @axe-core/playwright
- **Coverage**: Vitest coverage reports

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm run test:all

# Run unit tests in watch mode
npm test

# Run e2e tests
npm run test:e2e

# Run accessibility tests
npm run test:accessibility
```

## Available Scripts

### Unit Tests

```bash
npm test                # Run unit tests in watch mode
npm run test:run        # Run unit tests once
npm run test:ui         # Open Vitest UI
npm run test:coverage   # Run with coverage report
```

### E2E Tests

```bash
npm run test:e2e        # Run all e2e tests
npm run test:e2e:ui     # Run with Playwright UI
```

### Accessibility Tests

```bash
npm run test:accessibility  # Run accessibility tests
```

## Project Structure

```
src/
├── components/
│   ├── __tests__/           # Component unit tests
│   │   ├── hero.test.tsx
│   │   ├── footer.test.tsx
│   │   ├── image-gallery.test.tsx
│   │   └── floating-office-button.test.tsx
│   └── ...
├── routes/
│   ├── __tests__/           # Route/page tests
│   │   └── landing-page.test.tsx
│   └── ...
├── test/
│   └── setup.ts             # Test setup and configuration
tests/
├── accessibility.spec.ts    # Accessibility tests
├── landing-page.spec.ts     # E2E tests for landing page
└── accessibility/           # Accessibility test results
```

## Unit Testing

### Technologies

- **Vitest**: Fast unit test runner
- **React Testing Library**: Testing utilities for React components
- **jsdom**: DOM environment for tests

### Example Unit Test

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyComponent from "../MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("handles user interaction", async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(screen.getByText("Clicked!")).toBeInTheDocument();
  });
});
```

### Testing Patterns

#### Component Testing

```tsx
// Test rendering
expect(screen.getByRole("button")).toBeInTheDocument();

// Test user interactions
await user.click(screen.getByRole("button"));
await user.type(screen.getByRole("textbox"), "Hello");

// Test accessibility
expect(screen.getByRole("button")).toHaveAttribute("aria-label");
```

#### Mocking

```tsx
// Mock external dependencies
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, ...props }) => <a {...props}>{children}</a>,
}));

// Mock components
vi.mock("./components/ComplexComponent", () => ({
  default: () => <div data-testid="complex-component">Mocked</div>,
}));
```

## E2E Testing

### Technologies

- **Playwright**: Cross-browser testing framework
- **Multiple Browsers**: Chrome, Firefox, Safari, Mobile

### Example E2E Test

```typescript
import { test, expect } from "@playwright/test";

test("user can complete booking flow", async ({ page }) => {
  await page.goto("/");

  // Navigate to calendar
  await page.locator("#calendar").scrollIntoViewIfNeeded();

  // Select date
  await page.locator('button:has-text("15")').click();

  // Verify booking options appear
  await expect(page.locator("#options")).toBeVisible();
});
```

### Cross-Browser Testing

Tests run on:

- Desktop Chrome
- Desktop Firefox
- Desktop Safari (WebKit)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## Accessibility Testing

### WCAG Compliance

Tests ensure compliance with:

- WCAG 2.0 A & AA
- WCAG 2.1 AA
- Section 508

### Example Accessibility Test

```typescript
import AxeBuilder from "@axe-core/playwright";

test("page has no accessibility violations", async ({ page }) => {
  await page.goto("/");

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    css: true,
  },
});
```

### Playwright Configuration (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
});
```

## Coverage Reports

### Generate Coverage

```bash
npm run test:coverage
```

Coverage reports include:

- Line coverage
- Function coverage
- Branch coverage
- Statement coverage

Reports are generated in:

- Terminal summary
- HTML report in `coverage/` directory
- LCOV format for CI integration

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:run

      - name: Install Playwright
        run: npx playwright install

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Run accessibility tests
        run: npm run test:accessibility
```

## Best Practices

### Unit Tests

1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Arrange, Act, Assert pattern**
4. **Mock external dependencies**
5. **Test edge cases and error states**

### E2E Tests

1. **Test critical user journeys**
2. **Use reliable selectors (data-testid, roles)**
3. **Wait for elements properly**
4. **Test across multiple browsers**
5. **Keep tests independent**

### Accessibility Tests

1. **Test with real assistive technologies**
2. **Include keyboard navigation tests**
3. **Test color contrast**
4. **Verify proper ARIA usage**
5. **Test with screen readers**

## Debugging Tests

### Unit Tests

```bash
# Debug specific test
npm test -- --run --reporter=verbose MyComponent

# Open Vitest UI for debugging
npm run test:ui
```

### E2E Tests

```bash
# Run with headed browser
npx playwright test --headed

# Run with UI mode
npm run test:e2e:ui

# Debug mode
npx playwright test --debug
```

### Common Issues

1. **Timing Issues**: Use `waitFor` and proper async/await
2. **Mock Issues**: Ensure mocks are cleared between tests
3. **DOM Cleanup**: React Testing Library auto-cleanup is configured
4. **Environment**: Tests run in jsdom for unit tests, real browsers for e2e

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [axe-core Accessibility Testing](https://github.com/dequelabs/axe-core)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
