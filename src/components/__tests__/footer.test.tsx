import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "../footer";

// Mock next-themes
const mockUseTheme = vi.fn();
vi.mock("next-themes", () => ({
  useTheme: () => mockUseTheme(),
  ThemeProvider: ({ children }: any) => <div>{children}</div>,
}));

// Mock TanStack Router
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe("Footer Component", () => {
  const renderWithTheme = (theme = "light") => {
    mockUseTheme.mockReturnValue({ theme });
    return render(<Footer />);
  };

  it("renders without crashing", () => {
    renderWithTheme();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("displays company information", () => {
    renderWithTheme();

    expect(screen.getByText("לופט 5")).toBeInTheDocument();
    expect(screen.getByText('רחוב 8, א"ת קצרין')).toBeInTheDocument();
    expect(screen.getByText("052-440-0382")).toBeInTheDocument();
    expect(screen.getByText("info@loft5.co.il")).toBeInTheDocument();
  });
  it("displays navigation links", () => {
    renderWithTheme();

    expect(
      screen.getByRole("link", { name: /תקנון אתר/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /מדיניות נגישות/i }),
    ).toBeInTheDocument();
  });

  it("displays current year in copyright", () => {
    renderWithTheme();

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(currentYear.toString())),
    ).toBeInTheDocument();
  });

  it("applies correct theme classes for light theme", () => {
    renderWithTheme("light");

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("bg-gray-100");
  });

  it("applies correct theme classes for dark theme", () => {
    renderWithTheme("dark");

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("bg-gray-900");
  });

  it("has proper accessibility attributes", () => {
    renderWithTheme();

    // Footer should have contentinfo role
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();

    // Links should be accessible
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("href");
    });
  });

  it("supports keyboard navigation", () => {
    renderWithTheme();

    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).not.toHaveAttribute("tabindex", "-1");
    });
  });

  it("has responsive design classes", () => {
    renderWithTheme();

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("py-10");

    // Check for responsive grid
    const container = footer.querySelector(".container");
    expect(container).toBeInTheDocument();
  });
});
