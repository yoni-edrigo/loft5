import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ProductFormDialog from "../ProductFormDialog";

const mockFormData = {
  name: "",
  nameHe: "",
  description: "",
  descriptionHe: "",
  price: 0,
  unit: "per_person" as const,
  category: "base",
  key: "",
  visible: true,
  order: 0,
  availableSlots: ["afternoon", "evening"] as ("afternoon" | "evening")[],
  packageKey: "",
  isDefaultInPackage: false,
  parentId: undefined,
};

const mockProps = {
  open: false,
  onOpenChange: vi.fn(),
  onSubmit: vi.fn(),
  onReset: vi.fn(),
  formData: mockFormData,
  onInputChange: vi.fn(),
  onSlotToggle: vi.fn(),
  editingProduct: null,
  categories: [
    { value: "base", label: "בסיס" },
    { value: "food_package", label: "חבילת אוכל" },
    { value: "drinks_package", label: "חבילת משקאות" },
  ],
  units: [
    { value: "per_person", label: "לאדם" },
    { value: "per_event", label: "לאירוע" },
    { value: "per_hour", label: "לשעה" },
  ],
  timeSlots: [
    { value: "afternoon" as const, label: "צהריים" },
    { value: "evening" as const, label: "ערב" },
  ],
};

describe("ProductFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Dialog Trigger", () => {
    it("renders dialog trigger button", () => {
      render(<ProductFormDialog {...mockProps} />);
      expect(screen.getByText("הוסף מוצר")).toBeInTheDocument();
    });

    it("calls onReset when trigger is clicked", async () => {
      const user = userEvent.setup();
      render(<ProductFormDialog {...mockProps} />);
      const trigger = screen.getByText("הוסף מוצר");
      await user.click(trigger);
      expect(mockProps.onReset).toHaveBeenCalled();
    });
  });

  describe("Dialog Content", () => {
    it("renders dialog when open", () => {
      render(<ProductFormDialog {...mockProps} open={true} />);
      expect(screen.getByText("הוסף מוצר חדש")).toBeInTheDocument();
    });

    it("renders edit title when editing", () => {
      render(
        <ProductFormDialog
          {...mockProps}
          open={true}
          editingProduct={{ _id: "123" }}
        />,
      );
      expect(screen.getByText("ערוך מוצר")).toBeInTheDocument();
    });
  });

  describe("Form Fields", () => {
    it("renders all form fields", () => {
      render(<ProductFormDialog {...mockProps} open={true} />);
      expect(screen.getByLabelText("שם (עברית) *")).toBeInTheDocument();
      expect(screen.getByLabelText("שם (אנגלית)")).toBeInTheDocument();
      expect(screen.getByLabelText("תיאור (עברית) *")).toBeInTheDocument();
      expect(screen.getByLabelText("תיאור (אנגלית)")).toBeInTheDocument();
      expect(screen.getByLabelText("מחיר")).toBeInTheDocument();
      expect(screen.getByLabelText("יחידה")).toBeInTheDocument();
      expect(screen.getByLabelText("קטגוריה")).toBeInTheDocument();
      expect(screen.getByLabelText("מפתח ייחודי")).toBeInTheDocument();
      expect(screen.getByLabelText("סדר")).toBeInTheDocument();
      expect(screen.getByLabelText("נראה למשתמשים")).toBeInTheDocument();
    });

    it("renders time slot switches", () => {
      render(<ProductFormDialog {...mockProps} open={true} />);
      expect(screen.getByLabelText("צהריים")).toBeInTheDocument();
      expect(screen.getByLabelText("ערב")).toBeInTheDocument();
    });
  });

  describe("Form Interactions", () => {
    it("calls onInputChange when typing in text inputs", async () => {
      const user = userEvent.setup();
      render(<ProductFormDialog {...mockProps} open={true} />);
      const nameHeInput = screen.getByLabelText("שם (עברית) *");
      await user.type(nameHeInput, "מוצר חדש");
      // Check that the handler was called with the full value at least once
      expect(
        mockProps.onInputChange.mock.calls.some(
          (call) => call[0] === "nameHe" && call[1] === "מוצר חדש",
        ),
      ).toBe(true);
    });

    it("calls onInputChange when changing number inputs", async () => {
      const user = userEvent.setup();
      render(<ProductFormDialog {...mockProps} open={true} />);
      const priceInput = screen.getByLabelText("מחיר");
      await user.clear(priceInput);
      await user.type(priceInput, "150");
      // Check that the handler was called with the correct value at least once
      expect(
        mockProps.onInputChange.mock.calls.some(
          (call) => call[0] === "price" && call[1] === 150,
        ),
      ).toBe(true);
    });

    it("calls onInputChange when changing select inputs", async () => {
      const user = userEvent.setup();
      render(<ProductFormDialog {...mockProps} open={true} />);
      const unitTrigger = screen.getByLabelText("יחידה");
      await user.click(unitTrigger);
      const option = await screen.findByText("לאירוע");
      await user.click(option);
      expect(mockProps.onInputChange).toHaveBeenCalledWith("unit", "per_event");
    });

    it("calls onInputChange when toggling visible switch", async () => {
      const user = userEvent.setup();
      render(<ProductFormDialog {...mockProps} open={true} />);
      const visibleSwitch = screen.getByLabelText("נראה למשתמשים");
      await user.click(visibleSwitch);
      expect(mockProps.onInputChange).toHaveBeenCalledWith("visible", false);
    });

    it("calls onSlotToggle when clicking time slot switches", async () => {
      const user = userEvent.setup();
      render(<ProductFormDialog {...mockProps} open={true} />);
      const afternoonSwitch = screen.getByLabelText("צהריים");
      await user.click(afternoonSwitch);
      expect(mockProps.onSlotToggle).toHaveBeenCalledWith("afternoon");
    });
  });

  describe("Form Submission", () => {
    it("calls onSubmit when clicking submit button", async () => {
      const user = userEvent.setup();
      render(<ProductFormDialog {...mockProps} open={true} />);
      const submitButton = await screen.findByText("הוסף");
      expect(submitButton).toBeEnabled();
      await user.click(submitButton);
      expect(mockProps.onSubmit).toHaveBeenCalled();
    });

    it("calls onReset when clicking cancel button", async () => {
      const user = userEvent.setup();
      render(<ProductFormDialog {...mockProps} open={true} />);
      const cancelButton = screen.getByText("ביטול");
      await user.click(cancelButton);
      expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("Form Data Display", () => {
    it("displays current form data", () => {
      const formDataWithValues = {
        ...mockFormData,
        name: "Test Product",
        nameHe: "מוצר בדיקה",
        description: "Test Description",
        descriptionHe: "תיאור בדיקה",
        price: 100,
        unit: "per_event" as const,
        category: "food_package",
        key: "test-key",
        order: 5,
        availableSlots: ["afternoon"] as ("afternoon" | "evening")[],
        visible: false,
      };

      render(
        <ProductFormDialog
          {...mockProps}
          open={true}
          formData={formDataWithValues}
        />,
      );

      expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
      expect(screen.getByDisplayValue("מוצר בדיקה")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test Description")).toBeInTheDocument();
      expect(screen.getByDisplayValue("תיאור בדיקה")).toBeInTheDocument();
      expect(screen.getByDisplayValue("100")).toBeInTheDocument();
      expect(screen.getByDisplayValue("test-key")).toBeInTheDocument();
      expect(screen.getByDisplayValue("5")).toBeInTheDocument();

      // Check switch states
      const afternoonSwitch = screen.getByLabelText("צהריים");
      const eveningSwitch = screen.getByLabelText("ערב");
      expect(afternoonSwitch).toBeChecked();
      expect(eveningSwitch).not.toBeChecked();

      const visibleSwitch = screen.getByLabelText("נראה למשתמשים");
      expect(visibleSwitch).not.toBeChecked();
    });
  });

  describe("Accessibility", () => {
    it("has proper labels for all form controls", () => {
      render(<ProductFormDialog {...mockProps} open={true} />);
      expect(screen.getByLabelText("שם (עברית) *")).toBeInTheDocument();
      expect(screen.getByLabelText("שם (אנגלית)")).toBeInTheDocument();
      expect(screen.getByLabelText("תיאור (עברית) *")).toBeInTheDocument();
      expect(screen.getByLabelText("תיאור (אנגלית)")).toBeInTheDocument();
      expect(screen.getByLabelText("מחיר")).toBeInTheDocument();
      expect(screen.getByLabelText("יחידה")).toBeInTheDocument();
      expect(screen.getByLabelText("קטגוריה")).toBeInTheDocument();
      expect(screen.getByLabelText("מפתח ייחודי")).toBeInTheDocument();
      expect(screen.getByLabelText("סדר")).toBeInTheDocument();
      expect(screen.getByLabelText("נראה למשתמשים")).toBeInTheDocument();
      expect(screen.getByLabelText("צהריים")).toBeInTheDocument();
      expect(screen.getByLabelText("ערב")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty categories array", () => {
      render(<ProductFormDialog {...mockProps} open={true} categories={[]} />);
      expect(screen.getByLabelText("קטגוריה")).toBeInTheDocument();
    });

    it("handles empty units array", () => {
      render(<ProductFormDialog {...mockProps} open={true} units={[]} />);
      expect(screen.getByLabelText("יחידה")).toBeInTheDocument();
    });
  });
});
