"use client";

import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface TimeSlotSelectorProps {
  date: Date | null;
  availableSlots: string[];
  onTimeSlotSelect: (timeSlot: TimeSlot) => void;
  onAvailableSlotSelect: (slotRange: string) => void;
  selectedTimeSlot: TimeSlot | null;
  customStartTime: string;
  customEndTime: string;
  onCustomStartTimeChange: (value: string) => void;
  onCustomEndTimeChange: (value: string) => void;
  timeSlots: TimeSlot[];
  className?: string;
}

export default function TimeSlotSelector({
  date,
  availableSlots,
  onTimeSlotSelect,
  onAvailableSlotSelect,
  selectedTimeSlot,
  customStartTime,
  customEndTime,
  onCustomStartTimeChange,
  onCustomEndTimeChange,
  timeSlots,
  className = "",
}: TimeSlotSelectorProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-xl overflow-hidden ${className}`}
    >
      <div className="p-4 sm:p-6 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <h2 className="text-lg sm:text-xl font-bold">בחר שעות</h2>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {date ? (
          <>
            <div className="text-center mb-4">
              <h3 className="font-medium">שעות פנויות לתאריך</h3>
              <p className="text-primary font-bold">
                {format(date, "dd/MM/yyyy", { locale: he })}
              </p>
            </div>

            {availableSlots.length > 0 ? (
              <div className="space-y-2">
                <h3 className="font-medium text-sm sm:text-base">
                  שעות פנויות
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {availableSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-between h-12 sm:h-10 text-sm sm:text-base hover:bg-secondary hover:text-secondary-foreground"
                      onClick={() => onAvailableSlotSelect(slot)}
                    >
                      <span>{slot}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-4 bg-muted rounded-md">
                <p>אין שעות פנויות לתאריך זה</p>
              </div>
            )}

            <div className="space-y-2 sm:space-y-3">
              <h3 className="font-medium text-sm sm:text-base">התאמה אישית</h3>
              <Button
                variant={
                  selectedTimeSlot?.id === "custom" ? "default" : "outline"
                }
                className={`w-full justify-center h-12 sm:h-10 text-sm sm:text-base ${
                  selectedTimeSlot?.id === "custom"
                    ? "bg-secondary text-secondary-foreground"
                    : ""
                }`}
                onClick={() => onTimeSlotSelect(timeSlots[3])}
              >
                בחר שעות מותאמות אישית
              </Button>

              <AnimatePresence>
                {selectedTimeSlot?.id === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-3"
                  >
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="startTime" className="text-sm">
                          שעת התחלה
                        </Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={customStartTime}
                          onChange={(e) =>
                            onCustomStartTimeChange(e.target.value)
                          }
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="endTime" className="text-sm">
                          שעת סיום
                        </Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={customEndTime}
                          onChange={(e) =>
                            onCustomEndTimeChange(e.target.value)
                          }
                          className="h-10"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="text-center p-6">
            <p className="text-muted-foreground">נא לבחור תאריך מהלוח שנה</p>
          </div>
        )}

        <div className="pt-3 sm:pt-4 border-t">
          <div className="space-y-2">
            <h3 className="font-medium text-sm sm:text-base">סיכום בחירה</h3>
            <div className="p-3 sm:p-4 bg-muted rounded-md space-y-2 text-sm sm:text-base">
              <div className="flex justify-between">
                <span>תאריך:</span>
                <span className="font-medium">
                  {date
                    ? format(date, "dd/MM/yyyy", { locale: he })
                    : "לא נבחר"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>שעות:</span>
                <span className="font-medium">
                  {selectedTimeSlot
                    ? selectedTimeSlot.id === "custom"
                      ? `${customStartTime} - ${customEndTime}`
                      : `${selectedTimeSlot.startTime} - ${selectedTimeSlot.endTime}`
                    : "לא נבחר"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
