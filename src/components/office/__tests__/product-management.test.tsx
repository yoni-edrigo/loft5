import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ProductManagement from "../product-management";
import { useQuery, useMutation } from "convex/react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock dependencies
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useSearch: vi.fn(),
  useNavigate: vi.fn(),
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: vi.fn(),
}));

// Mock data
const mockProducts = [
  {
    _id: "1",
    name: "Product 1",
    nameHe: "מוצר 1",
    description: "Description 1",
    descriptionHe: "תיאור 1",
    price: 100,
    unit: "per_person" as const,
    category: "base",
    key: "product1",
    visible: true,
    order: 1,
    availableSlots: ["afternoon", "evening"] as const,
  },
  {
    _id: "2",
    name: "Product 2",
    nameHe: "מוצר 2",
    description: "Description 2",
    descriptionHe: "תיאור 2",
    price: 200,
    unit: "per_event" as const,
    category: "food_package",
    key: "product2",
    visible: false,
    order: 2,
    availableSlots: ["afternoon"] as const,
  },
  {
    _id: "3",
    name: "Product 3",
    nameHe: "מוצר 3",
    description: "Description 3",
    descriptionHe: "תיאור 3",
    price: 150,
    unit: "per_hour" as const,
    category: "drinks_package",
    key: "product3",
    visible: true,
    order: 3,
    availableSlots: ["evening"] as const,
  },
];

const mockSearch = {
  tab: "products",
  searchTerm: "",
  categoryFilter: "all",
  visibilityFilter: "all",
  sortBy: "order",
  sortOrder: "asc",
};

const mockNavigate = vi.fn();

describe("ProductManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    (useQuery as any).mockReturnValue(mockProducts);
    (useMutation as any).mockReturnValue(vi.fn());
    (useSearch as any).mockReturnValue(mockSearch);
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useIsMobile as any).mockReturnValue(false);
  });

  describe("Rendering", () => {
    it("renders loading state when products are undefined", () => {
      (useQuery as any).mockReturnValue(undefined);

      render(<ProductManagement />);

      expect(screen.getByText("טוען...")).toBeInTheDocument();
    });

    it("renders product management title", () => {
      render(<ProductManagement />);

      expect(screen.getByText("ניהול מוצרים")).toBeInTheDocument();
    });

    it("renders filter section", () => {
      render(<ProductManagement />);

      expect(screen.getByText("סינון ומיון")).toBeInTheDocument();
    });

    it("renders product table on desktop", () => {
      render(<ProductManagement />);

      // Check for table headers
      expect(screen.getByText("שם")).toBeInTheDocument();
      expect(screen.getByText("מחיר")).toBeInTheDocument();
      expect(screen.getByText("קטגוריה")).toBeInTheDocument();
    });

    it("renders mobile filter toggle on mobile", () => {
      (useIsMobile as any).mockReturnValue(true);

      render(<ProductManagement />);

      expect(screen.getByText("סינון ומיון")).toBeInTheDocument();
    });
  });

  describe("Filtering", () => {
    it("filters products by search term", async () => {
      const user = userEvent.setup();

      render(<ProductManagement />);

      const searchInput = screen.getByPlaceholderText("חיפוש מוצרים...");
      await user.type(searchInput, "מוצר 1");

      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.objectContaining({
          searchTerm: "מוצר 1",
        }),
        replace: true,
      });
    });

    it("filters products by category", async () => {
      const user = userEvent.setup();

      render(<ProductManagement />);

      const categorySelect = screen.getByLabelText("קטגוריה");
      await user.selectOptions(categorySelect, "base");

      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.objectContaining({
          categoryFilter: "base",
        }),
        replace: true,
      });
    });

    it("filters products by visibility", async () => {
      const user = userEvent.setup();

      render(<ProductManagement />);

      const visibilitySelect = screen.getByLabelText("נראות");
      await user.selectOptions(visibilitySelect, "visible");

      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.objectContaining({
          visibilityFilter: "visible",
        }),
        replace: true,
      });
    });

    it("clears all filters", async () => {
      const user = userEvent.setup();

      render(<ProductManagement />);

      const clearButton = screen.getByText("נקה סינון");
      await user.click(clearButton);

      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.objectContaining({
          searchTerm: undefined,
          categoryFilter: undefined,
          visibilityFilter: undefined,
          sortBy: undefined,
          sortOrder: undefined,
        }),
        replace: true,
      });
    });
  });

  describe("Sorting", () => {
    it("sorts products by name", async () => {
      const user = userEvent.setup();

      render(<ProductManagement />);

      const nameHeader = screen.getByText("שם");
      await user.click(nameHeader);

      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.objectContaining({
          sortBy: "name",
          sortOrder: "asc",
        }),
        replace: true,
      });
    });

    it("sorts products by price", async () => {
      const user = userEvent.setup();

      render(<ProductManagement />);

      const priceHeader = screen.getByText("מחיר");
      await user.click(priceHeader);

      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.objectContaining({
          sortBy: "price",
          sortOrder: "asc",
        }),
        replace: true,
      });
    });

    it("sorts products by category", async () => {
      const user = userEvent.setup();

      render(<ProductManagement />);

      const categoryHeader = screen.getByText("קטגוריה");
      await user.click(categoryHeader);

      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.objectContaining({
          sortBy: "category",
          sortOrder: "asc",
        }),
        replace: true,
      });
    });

    it("toggles sort order when clicking same column", async () => {
      const user = userEvent.setup();

      // Mock current sort state
      (useSearch as any).mockReturnValue({
        ...mockSearch,
        sortBy: "name",
        sortOrder: "asc",
      });

      render(<ProductManagement />);

      const nameHeader = screen.getByText("שם");
      await user.click(nameHeader);

      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.objectContaining({
          sortBy: "name",
          sortOrder: "desc",
        }),
        replace: true,
      });
    });
  });

  describe("Product Form", () => {
    it("opens add product dialog", async () => {
      const user = userEvent.setup();

      render(<ProductManagement />);

      const addButton = screen.getByText("הוסף מוצר");
      await user.click(addButton);

      expect(screen.getByText("הוסף מוצר חדש")).toBeInTheDocument();
    });

    it("opens edit product dialog", async () => {
      const user = userEvent.setup();

      render(<ProductManagement />);

      const editButtons = screen.getAllByLabelText("ערוך");
      await user.click(editButtons[0]);

      expect(screen.getByText("ערוך מוצר")).toBeInTheDocument();
    });

    it("submits product form", async () => {
      const user = userEvent.setup();
      const mockCreateMutation = vi.fn();
      (useMutation as any).mockReturnValue(mockCreateMutation);

      render(<ProductManagement />);

      // Open add dialog
      const addButton = screen.getByText("הוסף מוצר");
      await user.click(addButton);

      // Fill form
      const nameInput = screen.getByLabelText("שם (עברית)");
      await user.type(nameInput, "מוצר חדש");

      const priceInput = screen.getByLabelText("מחיר");
      await user.clear(priceInput);
      await user.type(priceInput, "150");

      // Submit form
      const submitButton = screen.getByText("שמור");
      await user.click(submitButton);

      expect(mockCreateMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          nameHe: "מוצר חדש",
          price: 150,
        }),
      );
    });
  });

  describe("Product Actions", () => {
    it("deletes product with confirmation", async () => {
      const user = userEvent.setup();
      const mockDeleteMutation = vi.fn();
      (useMutation as any).mockReturnValue(mockDeleteMutation);

      // Mock window.confirm
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

      render(<ProductManagement />);

      const deleteButtons = screen.getAllByLabelText("מחק");
      await user.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalledWith(
        "האם אתה בטוח שברצונך למחוק מוצר זה?",
      );
      expect(mockDeleteMutation).toHaveBeenCalledWith({ id: "1" });

      confirmSpy.mockRestore();
    });

    it("cancels product deletion", async () => {
      const user = userEvent.setup();
      const mockDeleteMutation = vi.fn();
      (useMutation as any).mockReturnValue(mockDeleteMutation);

      // Mock window.confirm
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

      render(<ProductManagement />);

      const deleteButtons = screen.getAllByLabelText("מחק");
      await user.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalledWith(
        "האם אתה בטוח שברצונך למחוק מוצר זה?",
      );
      expect(mockDeleteMutation).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe("Helper Functions", () => {
    it("getCategoryLabel returns correct Hebrew label", () => {
      render(<ProductManagement />);

      // Test each category
      expect(screen.getByText("בסיס")).toBeInTheDocument();
      expect(screen.getByText("חבילת אוכל")).toBeInTheDocument();
      expect(screen.getByText("חבילת משקאות")).toBeInTheDocument();
    });

    it("getUnitLabel returns correct Hebrew label", () => {
      render(<ProductManagement />);

      // Check for unit labels in the table
      expect(screen.getByText("לאדם")).toBeInTheDocument();
      expect(screen.getByText("לאירוע")).toBeInTheDocument();
      expect(screen.getByText("לשעה")).toBeInTheDocument();
    });

    it("getSlotLabels returns correct Hebrew labels", () => {
      render(<ProductManagement />);

      // Check for slot labels in the table
      expect(screen.getByText("צהריים")).toBeInTheDocument();
      expect(screen.getByText("ערב")).toBeInTheDocument();
    });
  });

  describe("Mobile Responsiveness", () => {
    it("shows mobile filter toggle on mobile", () => {
      (useIsMobile as any).mockReturnValue(true);

      render(<ProductManagement />);

      const filterToggle = screen.getByText("סינון ומיון");
      expect(filterToggle).toBeInTheDocument();
    });

    it("toggles mobile filters", async () => {
      const user = userEvent.setup();
      (useIsMobile as any).mockReturnValue(true);

      render(<ProductManagement />);

      const filterToggle = screen.getByText("סינון ומיון");
      await user.click(filterToggle);

      // Should show filter options
      expect(
        screen.getByPlaceholderText("חיפוש מוצרים..."),
      ).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("handles mutation errors gracefully", async () => {
      const user = userEvent.setup();
      const mockCreateMutation = vi
        .fn()
        .mockRejectedValue(new Error("API Error"));
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      (useMutation as any).mockReturnValue(mockCreateMutation);

      render(<ProductManagement />);

      // Open add dialog and submit
      const addButton = screen.getByText("הוסף מוצר");
      await user.click(addButton);

      const submitButton = screen.getByText("שמור");
      await user.click(submitButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error saving product:",
          expect.any(Error),
        );
      });

      consoleSpy.mockRestore();
    });
  });
});
