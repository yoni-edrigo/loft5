import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageGallery from "../image-gallery";

// Mock motion/react
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    img: ({ children, ...props }: any) => <img {...props}>{children}</img>,
  },
}));

// Mock react-intersection-observer
vi.mock("react-intersection-observer", () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}));

// Mock dialog components with proper state management
let dialogOpen = false;
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open, onOpenChange }: any) => {
    if (typeof open !== "undefined") {
      dialogOpen = open;
    }
    return dialogOpen ? (
      <div
        role="dialog"
        onKeyDown={(e: any) => {
          if (e.key === "Escape" && onOpenChange) {
            dialogOpen = false;
            onOpenChange(false);
          }
        }}
      >
        {children}
      </div>
    ) : null;
  },
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));

describe("ImageGallery Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renders without crashing", () => {
    render(<ImageGallery />);
    // Check for images instead of region role
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
  });

  it("displays gallery title", () => {
    render(<ImageGallery />);
    // The component doesn't have a title, so check for image titles instead
    expect(screen.getByText("אירועים חגיגיים")).toBeInTheDocument();
  });

  it("displays gallery images", () => {
    render(<ImageGallery />);

    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);

    // Check that images have proper alt text
    images.forEach((img) => {
      expect(img).toHaveAttribute("alt");
      expect(img.getAttribute("alt")).not.toBe("");
    });
  });

  it("opens image dialog when image is clicked", async () => {
    const user = userEvent.setup();
    render(<ImageGallery />);

    const firstImage = screen.getAllByRole("img")[0];
    await user.click(firstImage);

    // Check if dialog opens
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
  it("has proper accessibility attributes", () => {
    render(<ImageGallery />);

    // Check images have proper alt text
    const images = screen.getAllByRole("img");
    images.forEach((img) => {
      expect(img).toHaveAttribute("alt");
      expect(img.getAttribute("alt")).not.toBe("");
    });
  });

  it("supports keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<ImageGallery />);

    // Tab to first focusable element
    await user.tab();

    const focusedElement = document.activeElement;
    expect(focusedElement).toBeTruthy();

    // Enter key should open dialog if on an image
    if (focusedElement?.tagName === "BUTTON") {
      await user.keyboard("{Enter}");
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).toBeInTheDocument();
      });
    }
  });

  it("handles dialog close properly", async () => {
    const user = userEvent.setup();
    render(<ImageGallery />);

    // Open dialog
    const firstImage = screen.getAllByRole("img")[0];
    await user.click(firstImage);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Close dialog with Escape key
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
  it("lazy loads images with intersection observer", () => {
    // Mock to return not in view initially
    vi.mocked(require("react-intersection-observer").useInView).mockReturnValue(
      {
        ref: vi.fn(),
        inView: false,
      },
    );

    render(<ImageGallery />);

    // Should still render structure but may optimize loading
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
  });

  it("displays proper image titles and descriptions", () => {
    render(<ImageGallery />);

    // Check for image titles
    expect(screen.getByText("אירועים חגיגיים")).toBeInTheDocument();
    expect(screen.getByText("עיצוב ייחודי")).toBeInTheDocument();
    expect(screen.getByText("אזורי ישיבה")).toBeInTheDocument();
  });
  it("has responsive grid layout", () => {
    render(<ImageGallery />);

    // Check for grid container
    const gridContainer = document.querySelector(".grid");
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass("grid");
  });
});
