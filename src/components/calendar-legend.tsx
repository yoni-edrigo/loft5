interface LegendItem {
  color: string;
  label: string;
  textColor?: string;
}

interface CalendarLegendProps {
  items: LegendItem[];
  className?: string;
}

export default function CalendarLegend({
  items,
  className = "",
}: CalendarLegendProps) {
  return (
    <div
      className={`flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6 ${className}`}
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full border ${item.color}`}
            style={{
              // Fallback for better visibility
              minWidth: "12px",
              minHeight: "12px",
            }}
          ></div>
          <span
            className={`text-xs sm:text-sm md:text-base ${item.textColor || ""}`}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
