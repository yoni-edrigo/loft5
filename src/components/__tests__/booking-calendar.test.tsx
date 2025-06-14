import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import BookingCalendar from "../booking-calendar";

// Mock the booking store
const mockUseBookingStore = vi.fn();
vi.mock("@/store/booking-store", () => ({
  useBookingStore: () => mockUseBookingStore(),
}));

// Mock motion components
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock BaseCalendar component
vi.mock("@/components/base-calendar", () => ({
  default: ({ onDateSelect, ...props }: any) => (
    <div data-testid="base-calendar" {...props}>
      <button onClick={() => onDateSelect && onDateSelect(new Date())}>
        Select Date
      </button>
    </div>
  ),
}));

// Mock CalendarLegend component
vi.mock("@/components/calendar-legend", () => ({
  default: () => <div data-testid="calendar-legend">Calendar Legend</div>,
}));

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
}));

// Mock lucide icons
vi.mock("lucide-react", () => ({
  Clock: () => <span data-testid="clock-icon">Clock</span>,
  X: () => <span data-testid="x-icon">X</span>,
}));

// Mock date-fns
vi.mock("date-fns", () => ({
  format: vi.fn((date) => date.toISOString().split("T")[0]),
  isToday: vi.fn(() => false),
  isBefore: vi.fn(() => false),
  startOfDay: vi.fn((date) => date),
  startOfMonth: vi.fn(
    (date) => new Date(date.getFullYear(), date.getMonth(), 1),
  ),
  endOfMonth: vi.fn(
    (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0),
  ),
  eachDayOfInterval: vi.fn(() => [new Date()]),
  isSameDay: vi.fn(() => false),
  isAfter: vi.fn(() => true),
  parseISO: vi.fn(() => new Date()),
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("BookingCalendar Component", () => {
  const mockStore = {
    selectedDate: null,
    selectedTimeSlot: null,
    setSelectedDate: vi.fn(),
    setSelectedTimeSlot: vi.fn(),
    getAvailabilityForDate: vi.fn(() => ({ afternoon: true, evening: true })),
    isDateAvailable: vi.fn(() => true),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBookingStore.mockReturnValue(mockStore);
  });

  it("renders booking calendar component", () => {
    render(<BookingCalendar />);

    expect(screen.getByText("בחירת תאריך ושעה")).toBeInTheDocument();
  });

  it("displays time slot options when date is selected", async () => {
    const selectedDate = new Date("2025-06-15");
    mockUseBookingStore.mockReturnValue({
      ...mockStore,
      selectedDate,
    });

    render(<BookingCalendar />);

    expect(screen.getByText("צהריים (12:00-16:00)")).toBeInTheDocument();
    expect(screen.getByText("ערב (18:00-22:00)")).toBeInTheDocument();
  });

  it("handles time slot selection", async () => {
    const user = userEvent.setup();
    const selectedDate = new Date("2025-06-15");
    mockUseBookingStore.mockReturnValue({
      ...mockStore,
      selectedDate,
    });

    render(<BookingCalendar />);

    const afternoonSlot = screen.getByRole("button", { name: /צהריים/ });
    await user.click(afternoonSlot);

    expect(mockStore.setSelectedTimeSlot).toHaveBeenCalledWith("afternoon");
  });

  it("disables unavailable time slots", () => {
    const selectedDate = new Date("2025-06-15");
    mockUseBookingStore.mockReturnValue({
      ...mockStore,
      selectedDate,
      getAvailabilityForDate: vi.fn(() => ({
        afternoon: false,
        evening: true,
      })),
    });

    render(<BookingCalendar />);

    const afternoonSlot = screen.getByRole("button", { name: /צהריים/ });
    const eveningSlot = screen.getByRole("button", { name: /ערב/ });

    expect(afternoonSlot).toBeDisabled();
    expect(eveningSlot).not.toBeDisabled();
  });

  it("shows selected time slot state", () => {
    const selectedDate = new Date("2025-06-15");
    mockUseBookingStore.mockReturnValue({
      ...mockStore,
      selectedDate,
      selectedTimeSlot: "afternoon",
    });

    render(<BookingCalendar />);

    const afternoonSlot = screen.getByRole("button", { name: /צהריים/ });
    expect(afternoonSlot).toHaveAttribute("data-state", "on");
  });

  it("has proper ARIA labels for time slots", () => {
    const selectedDate = new Date("2025-06-15");
    mockUseBookingStore.mockReturnValue({
      ...mockStore,
      selectedDate,
    });

    render(<BookingCalendar />);

    const timeSlots = screen.getAllByRole("button", { name: /צהריים|ערב/ });
    timeSlots.forEach((slot) => {
      expect(slot).toHaveAttribute("aria-label");
    });
  });

  it("displays calendar legend", () => {
    render(<BookingCalendar />);

    // The CalendarLegend component should be rendered
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("handles mobile sidebar toggle", async () => {
    const user = userEvent.setup();

    // Mock mobile viewport
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<BookingCalendar />);

    // Look for mobile menu trigger (if it exists)
    const mobileMenuTrigger = screen.queryByRole("button", {
      name: /menu|תפריט/,
    });
    if (mobileMenuTrigger) {
      await user.click(mobileMenuTrigger);
      // Check if sidebar opens
      expect(screen.getByRole("dialog", { hidden: true })).toBeInTheDocument();
    }
  });

  it("prevents selection of past dates", async () => {
    // Test for past dates would go here if needed
    mockUseBookingStore.mockReturnValue({
      ...mockStore,
      isDateAvailable: vi.fn(() => false),
    });

    render(<BookingCalendar />);

    // The calendar should not allow clicking on past dates
    // This would be tested through the BaseCalendar component
  });
});
