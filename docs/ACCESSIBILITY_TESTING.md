# Accessibility Testing Guide

## Overview

This project includes comprehensive accessibility testing using @axe-core/playwright to ensure WCAG 2.1 AA compliance.

## Running Accessibility Tests

### Command Line

```bash
# Run all accessibility tests
npm run test:accessibility

# Run specific accessibility test
npx playwright test tests/accessibility.spec.ts

# Run with UI for debugging
npx playwright test tests/accessibility.spec.ts --ui
```

### Test Coverage

The accessibility tests cover:

1. **WCAG Compliance**: Tests against WCAG 2.0 A, AA, and 2.1 AA standards
2. **Color Contrast**: Ensures proper color contrast ratios
3. **Keyboard Navigation**: Verifies keyboard accessibility
4. **Heading Structure**: Checks for proper heading hierarchy
5. **Form Accessibility**: Tests form labels and ARIA attributes
6. **Interactive Elements**: Validates buttons, links, and dialogs

### Tested Pages

- Landing Page (/)
- Office Page (/office)
- Terms Page (/terms)
- Accessibility Page (/accessibility)

### Component-Specific Tests

- **Forms**: Sign-in forms, booking forms
- **Dialogs**: Modal dialogs with focus trapping
- **Interactive Elements**: Buttons with proper ARIA labels
- **Images**: Alt text validation

## Accessibility Standards

### WCAG 2.1 AA Requirements

- **Perceivable**: Content must be presentable in ways users can perceive
- **Operable**: Interface components must be operable
- **Understandable**: Information and UI operation must be understandable
- **Robust**: Content must be robust enough for various assistive technologies

### Key Requirements Tested

1. **Alternative Text**: All images have descriptive alt text
2. **Keyboard Navigation**: All interactive elements are keyboard accessible
3. **Focus Management**: Proper focus indicators and logical tab order
4. **Color Contrast**: Text has sufficient contrast against backgrounds
5. **Heading Structure**: Proper heading hierarchy (h1, h2, h3, etc.)
6. **Form Labels**: All form inputs have associated labels
7. **ARIA Attributes**: Proper use of ARIA labels and descriptions

## Common Issues and Fixes

### Missing Alt Text

```tsx
// ❌ Bad
<img src="image.jpg" />

// ✅ Good
<img src="image.jpg" alt="Descriptive text about the image" />
```

### Missing Form Labels

```tsx
// ❌ Bad
<input type="email" placeholder="Email" />

// ✅ Good
<label htmlFor="email">Email</label>
<input type="email" id="email" placeholder="Email" />
```

### Missing Button Labels

```tsx
// ❌ Bad
<button><Icon /></button>

// ✅ Good
<button aria-label="Close dialog"><Icon /></button>
```

### Proper Heading Structure

```tsx
// ❌ Bad - Skips heading levels
<h1>Main Title</h1>
<h3>Subsection</h3>

// ✅ Good - Proper hierarchy
<h1>Main Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

## Testing in Development

### Browser Extensions

- **axe DevTools**: Chrome/Firefox extension for manual testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Built-in Chrome accessibility auditing

### Manual Testing

1. **Keyboard Navigation**: Tab through all interactive elements
2. **Screen Reader**: Test with NVDA (Windows), JAWS, or VoiceOver (Mac)
3. **High Contrast**: Test with high contrast mode enabled
4. **Zoom**: Test at 200% zoom level

## Continuous Integration

The accessibility tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions step
- name: Run Accessibility Tests
  run: npm run test:accessibility
```

## Reporting

Test results are saved to:

- HTML Report: `test-results/playwright-report/`
- JSON Results: `test-results/results.json`
- Screenshots: Captured on failures for debugging

## Resources

### Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)

### Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Web Accessibility Evaluator](https://wave.webaim.org/)
- [Color Contrast Analyzers](https://www.tpgi.com/color-contrast-checker/)

## Best Practices

1. **Test Early**: Include accessibility tests in development workflow
2. **Automated + Manual**: Combine automated tests with manual testing
3. **Real Users**: Include users with disabilities in testing when possible
4. **Documentation**: Keep accessibility requirements documented
5. **Training**: Ensure team understands accessibility principles
