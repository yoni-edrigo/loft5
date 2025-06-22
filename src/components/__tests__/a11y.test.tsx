import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import userEvent from "@testing-library/user-event";

// Extend expect with axe matchers
expect.extend(toHaveNoViolations);

/**
 * Template for accessibility testing of components
 *
 * Usage:
 * 1. Import your component
 * 2. Replace the placeholder test with your component
 * 3. Add specific a11y tests for your component's functionality
 */

describe("Component Accessibility Template", () => {
  test("should not have accessibility violations", async () => {
    // Replace this with your actual component
    const { container } = render(
      <div>
        <h1>Test Component</h1>
        <button>Click me</button>
      </div>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("should have proper ARIA labels", () => {
    // Replace with your component
    render(
      <div>
        <button aria-label="Test button">Click me</button>
      </div>,
    );

    expect(screen.getByLabelText("Test button")).toBeInTheDocument();
  });

  test("should support keyboard navigation", async () => {
    const user = userEvent.setup();

    // Replace with your component
    render(
      <div>
        <button>First</button>
        <button>Second</button>
      </div>,
    );

    // Test tab navigation
    await user.tab();
    expect(screen.getByText("First")).toHaveFocus();

    await user.tab();
    expect(screen.getByText("Second")).toHaveFocus();
  });

  test("should have proper heading structure", () => {
    // Replace with your component
    render(
      <div>
        <h1>Main heading</h1>
        <h2>Sub heading</h2>
      </div>,
    );

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });
});
