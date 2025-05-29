"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { addMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns"
import { he } from "date-fns/locale"
import { ChevronRight, ChevronLeft } from "lucide-react"

// Abbreviated weekday names for small screens
const WEEKDAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"]
const WEEKDAYS_SHORT = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"]

interface BaseCalendarProps {
  onDateSelect: (date: Date) => void
  renderDay: (day: Date, isSelected: boolean, isHovered: boolean) => React.ReactNode
  renderFooter?: () => React.ReactNode
  renderHeader?: (currentMonth: Date, nextMonth: () => void, prevMonth: () => void) => React.ReactNode
  selectedDate: Date | null
  initialMonth?: Date
  className?: string
}

export default function BaseCalendar({
  onDateSelect,
  renderDay,
  renderFooter,
  renderHeader,
  selectedDate,
  initialMonth = new Date(),
  className = "",
}: BaseCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth)
  const [calendarDays, setCalendarDays] = useState<Date[]>([])
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)

  useEffect(() => {
    const days = eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    })
    setCalendarDays(days)
  }, [currentMonth])

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1))
  }

  const defaultHeader = (
    <div className="p-4 sm:p-6 bg-primary text-primary-foreground">
      <div className="flex justify-between items-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-primary-foreground/10"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 rtl-flip" />
        </motion.button>

        <h2 className="text-xl sm:text-2xl font-bold">{format(currentMonth, "MMMM yyyy", { locale: he })}</h2>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-primary-foreground/10"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 rtl-flip" />
        </motion.button>
      </div>
    </div>
  )

  return (
    <div className={`bg-white rounded-xl shadow-xl overflow-hidden ${className}`}>
      {renderHeader ? renderHeader(currentMonth, nextMonth, prevMonth) : defaultHeader}

      <div className="p-2 sm:p-4 md:p-6">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2 sm:mb-4">
          {WEEKDAYS.map((day, i) => (
            <div key={i} className="text-center font-medium text-muted-foreground hidden md:block">
              {day}
            </div>
          ))}
          {WEEKDAYS_SHORT.map((day, i) => (
            <div key={i} className="text-center font-medium text-muted-foreground md:hidden py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty cells for days before the start of the month */}
          {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
            <div key={`empty-start-${i}`} className="h-10 sm:h-12 md:h-16 lg:h-20"></div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, i) => {
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
            const isHovered = hoveredDate ? isSameDay(day, hoveredDate) : false
            const isCurrentMonth = isSameMonth(day, currentMonth)

            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative h-10 sm:h-12 md:h-16 lg:h-20 rounded-lg flex flex-col items-center justify-start p-1
                  cursor-pointer transition-all duration-200
                  ${isCurrentMonth ? "bg-muted" : "bg-muted/50 opacity-60"}
                  ${isSelected ? "ring-2 ring-secondary" : ""}
                `}
                onClick={() => onDateSelect(day)}
                onMouseEnter={() => setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                {renderDay(day, isSelected, isHovered)}
              </motion.div>
            )
          })}

          {/* Empty cells for days after the end of the month */}
          {Array.from({ length: 6 - endOfMonth(currentMonth).getDay() }).map((_, i) => (
            <div key={`empty-end-${i}`} className="h-10 sm:h-12 md:h-16 lg:h-20"></div>
          ))}
        </div>
      </div>

      {renderFooter && <div className="p-3 sm:p-4 md:p-6 bg-muted border-t">{renderFooter()}</div>}
    </div>
  )
}
