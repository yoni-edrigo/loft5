import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FloatingOfficeButton from "../floating-office-button";

// Mock motion/react
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, onHoverStart, onHoverEnd, whileTap, ...props }: any) => (
      <div {...props} onMouseEnter={onHoverStart} onMouseLeave={onHoverEnd}>
        {children}
      </div>
    ),
    button: ({ children, whileHover, whileTap, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  Briefcase: () => <span data-testid="briefcase-icon">Briefcase Icon</span>,
}));

// Mock TanStack Router
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

describe("FloatingOfficeButton Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<FloatingOfficeButton />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("displays the briefcase icon", () => {
    render(<FloatingOfficeButton />);
    expect(screen.getByTestId("briefcase-icon")).toBeInTheDocument();
  });
  it("is positioned as a floating button", () => {
    render(<FloatingOfficeButton />);
    // Check the container div, not the button itself
    const container = document.querySelector(".fixed");
    expect(container).toHaveClass("fixed", "bottom-6", "right-6", "z-50");
  });

  it("navigates to office page when clicked", async () => {
    const user = userEvent.setup();
    render(<FloatingOfficeButton />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/office",
      search: { tab: "bookings" },
    });
  });

  it("shows hover state", async () => {
    const user = userEvent.setup();
    render(<FloatingOfficeButton />);

    const button = screen.getByRole("button");

    // Hover over button
    await user.hover(button);

    // Button should still be present (hover effects handled by motion)
    expect(button).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<FloatingOfficeButton />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();

    // Should have accessible name or aria-label
    expect(button).toHaveAttribute("aria-label");
  });

  it("supports keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<FloatingOfficeButton />);

    // Tab to button
    await user.tab();

    const button = screen.getByRole("button");
    expect(button).toHaveFocus();

    // Enter should trigger navigation
    await user.keyboard("{Enter}");
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("supports space key activation", async () => {
    const user = userEvent.setup();
    render(<FloatingOfficeButton />);

    const button = screen.getByRole("button");
    button.focus();

    // Space should trigger navigation
    await user.keyboard(" ");
    expect(mockNavigate).toHaveBeenCalled();
  });
  it("has proper button styling", () => {
    render(<FloatingOfficeButton />);

    const button = screen.getByRole("button");

    // Should have button styling classes (use actual classes from the component)
    expect(button).toHaveClass("bg-secondary");
    expect(button).toHaveClass("text-secondary-foreground");
    expect(button).toHaveClass("rounded-full");
  });
  it("shows tooltip on hover", async () => {
    const user = userEvent.setup();
    render(<FloatingOfficeButton />);

    const button = screen.getByRole("button");
    await user.hover(button);

    // Check for tooltip text (actual text from component)
    expect(screen.getByText("משרד")).toBeInTheDocument();
  });

  it("handles mouse interactions properly", () => {
    render(<FloatingOfficeButton />);

    const container = screen.getByRole("button").closest("div");

    // Mouse enter should trigger hover state
    fireEvent.mouseEnter(container!);

    // Mouse leave should end hover state
    fireEvent.mouseLeave(container!);

    // Component should still be rendered
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
