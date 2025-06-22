import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ProductFilterSection from "../ProductFilterSection";

const mockProps = {
  searchTerm: "",
  categoryFilter: "all",
  visibilityFilter: "all",
  sortBy: "order",
  categories: [
    { value: "base", label: "בסיס" },
    { value: "food_package", label: "חבילת אוכל" },
    { value: "drinks_package", label: "חבילת משקאות" },
    { value: "snacks", label: "חטיפים" },
    { value: "addons", label: "תוספות" },
  ],
  onSearchChange: vi.fn(),
  onCategoryFilter: vi.fn(),
  onVisibilityFilter: vi.fn(),
  onSort: vi.fn(),
  onClearFilters: vi.fn(),
  resultsCount: 5,
  totalCount: 10,
};

describe("ProductFilterSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders all filter controls", () => {
      render(<ProductFilterSection {...mockProps} />);

      expect(
        screen.getByPlaceholderText("חיפוש מוצרים..."),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("קטגוריה")).toBeInTheDocument();
      expect(screen.getByLabelText("נראות")).toBeInTheDocument();
      expect(screen.getByLabelText("מיון לפי")).toBeInTheDocument();
      expect(screen.getByText("נקה סינון")).toBeInTheDocument();
    });

    it("displays results count", () => {
      render(<ProductFilterSection {...mockProps} />);

      expect(screen.getByText("5 מתוך 10 תוצאות")).toBeInTheDocument();
    });

    it("renders all category options", async () => {
      render(<ProductFilterSection {...mockProps} />);
      // Open the category select
      const categoryTrigger = screen.getByLabelText("קטגוריה");
      await userEvent.click(categoryTrigger);
      expect(await screen.findByText("בסיס")).toBeInTheDocument();
      expect(await screen.findByText("חבילת אוכל")).toBeInTheDocument();
      expect(await screen.findByText("חבילת משקאות")).toBeInTheDocument();
      expect(await screen.findByText("חטיפים")).toBeInTheDocument();
      expect(await screen.findByText("תוספות")).toBeInTheDocument();
    });

    it("renders all visibility options", async () => {
      render(<ProductFilterSection {...mockProps} />);
      // Open the visibility select
      const visibilityTrigger = screen.getByLabelText("נראות");
      await userEvent.click(visibilityTrigger);
      expect(await screen.findByText("כל המוצרים")).toBeInTheDocument();
      expect(await screen.findByText("נראים")).toBeInTheDocument();
      expect(await screen.findByText("מוסתרים")).toBeInTheDocument();
    });

    it("renders all sort options", async () => {
      render(<ProductFilterSection {...mockProps} />);
      // Open the sort select
      const sortTrigger = screen.getByLabelText("מיון לפי");
      await userEvent.click(sortTrigger);
      expect(await screen.findByText("סדר ברירת מחדל")).toBeInTheDocument();
      expect(await screen.findByText("שם")).toBeInTheDocument();
      expect(await screen.findByText("מחיר")).toBeInTheDocument();
      expect(await screen.findByText("קטגוריה")).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("calls onSearchChange when typing in search input", async () => {
      const user = userEvent.setup();
      render(<ProductFilterSection {...mockProps} />);
      const searchInput = screen.getByLabelText("חיפוש");
      await user.type(searchInput, "test");
      // Check that the handler was called with the full value at least once
      expect(
        mockProps.onSearchChange.mock.calls.some((call) => call[0] === "test"),
      ).toBe(true);
    });

    it("displays current search term", () => {
      render(<ProductFilterSection {...mockProps} searchTerm="מוצר" />);

      const searchInput = screen.getByPlaceholderText("חיפוש מוצרים...");
      expect(searchInput).toHaveValue("מוצר");
    });
  });

  describe("Category Filter", () => {
    it("calls onCategoryFilter when selecting category", async () => {
      const user = userEvent.setup();
      render(<ProductFilterSection {...mockProps} />);

      const categoryTrigger = screen.getByLabelText("קטגוריה");
      await user.click(categoryTrigger);
      const option = await screen.findByRole("option", { name: "בסיס" });
      await user.click(option);

      expect(mockProps.onCategoryFilter).toHaveBeenCalledWith("base");
    });

    it("displays current category filter", () => {
      render(
        <ProductFilterSection {...mockProps} categoryFilter="food_package" />,
      );

      const categoryTrigger = screen.getByLabelText("קטגוריה");
      expect(categoryTrigger).toHaveTextContent("חבילת אוכל");
    });
  });

  describe("Visibility Filter", () => {
    it("calls onVisibilityFilter when selecting visibility", async () => {
      const user = userEvent.setup();
      render(<ProductFilterSection {...mockProps} />);

      const visibilityTrigger = screen.getByLabelText("נראות");
      await user.click(visibilityTrigger);
      const option = await screen.findByRole("option", { name: "נראים" });
      await user.click(option);

      expect(mockProps.onVisibilityFilter).toHaveBeenCalledWith("visible");
    });

    it("displays current visibility filter", () => {
      render(<ProductFilterSection {...mockProps} visibilityFilter="hidden" />);

      const visibilityTrigger = screen.getByLabelText("נראות");
      expect(visibilityTrigger).toHaveTextContent("מוסתרים");
    });
  });

  describe("Sorting", () => {
    it("calls onSort when selecting sort option", async () => {
      const user = userEvent.setup();
      render(<ProductFilterSection {...mockProps} />);

      const sortTrigger = screen.getByLabelText("מיון לפי");
      await user.click(sortTrigger);
      const option = await screen.findByRole("option", { name: "שם" });
      await user.click(option);

      expect(mockProps.onSort).toHaveBeenCalledWith("name");
    });

    it("displays current sort option", () => {
      render(<ProductFilterSection {...mockProps} sortBy="price" />);

      const sortTrigger = screen.getByLabelText("מיון לפי");
      expect(sortTrigger).toHaveTextContent("מחיר");
    });
  });

  describe("Clear Filters", () => {
    it("calls onClearFilters when clicking clear button", async () => {
      const user = userEvent.setup();
      render(<ProductFilterSection {...mockProps} />);

      const clearButton = screen.getByText("נקה סינון");
      await user.click(clearButton);

      expect(mockProps.onClearFilters).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty categories array", () => {
      render(<ProductFilterSection {...mockProps} categories={[]} />);

      expect(screen.getByText("כל הקטגוריות")).toBeInTheDocument();
    });

    it("handles zero results", () => {
      render(
        <ProductFilterSection {...mockProps} resultsCount={0} totalCount={0} />,
      );

      expect(screen.getByText("0 מתוך 0 תוצאות")).toBeInTheDocument();
    });

    it("handles single result", () => {
      render(
        <ProductFilterSection {...mockProps} resultsCount={1} totalCount={1} />,
      );

      expect(screen.getByText("1 מתוך 1 תוצאות")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper labels for all form controls", () => {
      render(<ProductFilterSection {...mockProps} />);

      expect(screen.getByLabelText("קטגוריה")).toBeInTheDocument();
      expect(screen.getByLabelText("נראות")).toBeInTheDocument();
      expect(screen.getByLabelText("מיון לפי")).toBeInTheDocument();
    });

    it("has proper placeholder text", () => {
      render(<ProductFilterSection {...mockProps} />);

      expect(
        screen.getByPlaceholderText("חיפוש מוצרים..."),
      ).toBeInTheDocument();
    });
  });
});
