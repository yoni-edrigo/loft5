import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Hero from "../hero";

// Mock motion components
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    img: ({ children, ...props }: any) => <img {...props}>{children}</img>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

describe("Hero Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders hero component with default content", () => {
    render(<Hero />);

    expect(screen.getByText("ברוכים הבאים ללופט 5")).toBeInTheDocument();
    expect(
      screen.getByText("מרחב עבודה ואירועים ברמה גבוהה"),
    ).toBeInTheDocument();
  });

  it("displays carousel navigation dots", () => {
    render(<Hero />);

    const dots = screen.getAllByRole("button", { name: /go to slide/i });
    expect(dots).toHaveLength(2); // Default photos array has 2 items
  });

  it("has accessible carousel navigation", () => {
    render(<Hero />);

    const dots = screen.getAllByRole("button", { name: /go to slide/i });
    dots.forEach((dot, index) => {
      expect(dot).toHaveAttribute("aria-label", `Go to slide ${index + 1}`);
    });
  });

  it("handles carousel navigation clicks", async () => {
    render(<Hero />);

    const secondDot = screen.getByRole("button", { name: "Go to slide 2" });
    fireEvent.click(secondDot);

    // Wait for animation state to update
    await waitFor(() => {
      expect(secondDot).toHaveAttribute("aria-current", "true");
    });
  });

  it("displays hero images with proper alt text", () => {
    render(<Hero />);

    const images = screen.getAllByRole("img");
    images.forEach((img) => {
      expect(img).toHaveAttribute("alt");
      expect(img.getAttribute("alt")).not.toBe("");
    });
  });

  it("has proper heading structure", () => {
    render(<Hero />);

    const mainHeading = screen.getByRole("heading", { level: 1 });
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading).toHaveTextContent("ברוכים הבאים ללופט 5");
  });

  it("auto-advances carousel slides", async () => {
    vi.useFakeTimers();
    render(<Hero />);

    const firstDot = screen.getByRole("button", { name: "Go to slide 1" });
    const secondDot = screen.getByRole("button", { name: "Go to slide 2" });

    // Initially first slide should be active
    expect(firstDot).toHaveAttribute("aria-current", "true");

    // Fast-forward time to trigger auto-advance
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(secondDot).toHaveAttribute("aria-current", "true");
    });

    vi.useRealTimers();
  });

  it("pauses auto-advance on user interaction", async () => {
    vi.useFakeTimers();
    render(<Hero />);

    const secondDot = screen.getByRole("button", { name: "Go to slide 2" });

    // User clicks on a dot
    fireEvent.click(secondDot);

    // Auto-advance should be paused
    vi.advanceTimersByTime(10000);

    await waitFor(() => {
      expect(secondDot).toHaveAttribute("aria-current", "true");
    });

    vi.useRealTimers();
  });
});
