import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isBefore, startOfDay } from "date-fns";
import { he } from "date-fns/locale";
import { Clock, X } from "lucide-react";
import { useBookingStore } from "@/store/booking-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BaseCalendar from "@/components/base-calendar";
import CalendarLegend from "@/components/calendar-legend";
import { TimeSlot } from "@/lib/types";

const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  afternoon: "צהריים (12:00-16:00)",
  evening: "ערב (18:00-22:00)",
};

export default function BookingCalendar() {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const {
    selectedDate,
    selectedTimeSlot,
    setSelectedDate,
    setSelectedTimeSlot,
    getAvailabilityForDate,
    isDateAvailable,
  } = useBookingStore();

  const handleDateClick = (date: Date) => {
    // Don't allow past dates
    if (isBefore(date, startOfDay(new Date()))) {
      toast.error("לא ניתן לבחור תאריך שעבר");
      return;
    }

    if (!isDateAvailable(date)) {
      toast.error("תאריך לא זמין", {
        description: "נא לבחור תאריך אחר",
      });
      return;
    }

    setSelectedDate(date);
    setSelectedTimeSlot(null); // Reset time slot when date changes

    // Show mobile sidebar if on mobile
    if (window.innerWidth < 768) {
      setShowMobileSidebar(true);
    }

    toast.success("תאריך נבחר", {
      description: `${format(date, "dd/MM/yyyy", { locale: he })}`,
    });
  };

  const handleTimeSlotSelect = (slot: TimeSlot | null) => {
    if (!slot) return;

    setSelectedTimeSlot(slot);

    toast.success("שעות נבחרו", {
      description: TIME_SLOT_LABELS[slot],
    });

    // Close mobile sidebar after selection
    if (window.innerWidth < 768) {
      setShowMobileSidebar(false);
    }
  };

  const renderDay = (day: Date, isSelected: boolean, isHovered: boolean) => {
    const isPast = isBefore(day, startOfDay(new Date()));
    const available = isDateAvailable(day);
    const slots = getAvailabilityForDate(day);

    return (
      <>
        <span
          className={`
          text-sm sm:text-base md:text-lg font-medium
          ${isToday(day) ? "text-primary font-bold" : ""}
          ${isPast ? "text-muted-foreground/50" : ""}
          ${!available && !isPast ? "text-red-500" : ""}
          ${isSelected ? "text-secondary" : ""}
        `}
        >
          {format(day, "d")}
        </span>

        {!isPast && available && (
          <span className="text-[8px] sm:text-[10px] md:text-xs mt-0.5 sm:mt-1 text-green-600">
            {slots.filter((s) => !s.bookingId).length === 2 ? "פנוי" : "חלקי"}
          </span>
        )}

        {!isPast && !available && (
          <span className="text-[8px] sm:text-[10px] md:text-xs mt-0.5 sm:mt-1 text-red-500">
            תפוס
          </span>
        )}

        {isPast && (
          <span className="text-[8px] sm:text-[10px] md:text-xs mt-0.5 sm:mt-1 text-muted-foreground/50">
            עבר
          </span>
        )}

        {isSelected && (
          <motion.div
            layoutId="selected-date"
            className="absolute inset-0 rounded-lg border-2 border-secondary"
            transition={{ duration: 0.3 }}
          />
        )}

        {isHovered && available && !isPast && !isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-lg border-2 border-secondary/50"
          />
        )}
      </>
    );
  };

  const renderFooter = () => {
    const legendItems = [
      { color: "bg-green-100", label: "פנוי", textColor: "text-green-600" },
      { color: "bg-yellow-100", label: "חלקי", textColor: "text-yellow-600" },
      { color: "bg-red-100", label: "תפוס", textColor: "text-red-500" },
      {
        color: "border-2 border-secondary",
        label: "נבחר",
        textColor: "text-secondary",
      },
    ];

    return <CalendarLegend items={legendItems} />;
  };

  const renderTimeSlots = () => {
    if (!selectedDate) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              בחר תאריך כדי לראות שעות פנויות
            </p>
          </CardContent>
        </Card>
      );
    }

    const availableSlots = getAvailabilityForDate(selectedDate);
    if (!availableSlots || !Array.isArray(availableSlots)) return null;

    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5" />
              <h3 className="text-lg font-medium">בחר שעות</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {format(selectedDate, "dd/MM/yyyy", { locale: he })}
            </p>

            <div className="space-y-3">
              {availableSlots.map(
                (slot: { slot: TimeSlot; bookingId?: string }) => (
                  <Button
                    key={slot.slot}
                    variant={
                      selectedTimeSlot === slot.slot ? "default" : "outline"
                    }
                    className="w-full justify-between h-auto p-4"
                    disabled={!!slot.bookingId}
                    onClick={() =>
                      !slot.bookingId && handleTimeSlotSelect(slot.slot)
                    }
                  >
                    <div className="text-right">
                      <div className="font-medium">
                        {slot.slot === "afternoon" ? "צהריים" : "ערב"}
                      </div>
                      <div className="text-sm">
                        {TIME_SLOT_LABELS[slot.slot]}
                      </div>
                    </div>
                  </Button>
                ),
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="md:col-span-2"
      >
        <BaseCalendar
          onDateSelect={handleDateClick}
          renderDay={renderDay}
          renderFooter={renderFooter}
          selectedDate={selectedDate}
        />
      </motion.div>

      {/* Time slot selection - Desktop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="hidden md:block"
      >
        {renderTimeSlots()}
      </motion.div>

      {/* Mobile Time Slot Sidebar */}
      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-4/5 max-w-sm bg-white dark:bg-gray-900 shadow-xl md:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center">
                <h2 className="text-lg font-bold">בחר שעות</h2>
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-2 rounded-full hover:bg-primary-foreground/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                {renderTimeSlots()}
              </div>

              <div className="p-4 border-t">
                <Button
                  className="w-full bg-secondary text-secondary-foreground"
                  onClick={() => setShowMobileSidebar(false)}
                >
                  אישור
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
