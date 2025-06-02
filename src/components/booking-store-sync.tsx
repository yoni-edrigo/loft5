import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useBookingStore } from "../store/booking-store";
import { format } from "date-fns";
import { useEffect } from "react";

export function BookingStoreSync() {
  const pricing = useQuery(api.get_functions.getPricing);
  const setPricing = useBookingStore((state) => state.setPricing);

  // Get availability for current month and next month
  const currentDate = new Date();
  const startDate = format(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    "yyyy-MM-dd",
  );
  const endDate = format(
    new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0),
    "yyyy-MM-dd",
  );

  const availability = useQuery(api.get_functions.getAvailableDates, {
    startDate,
    endDate,
  });

  const setAvailability = useBookingStore((state) => state.setAvailability);

  // Update store with pricing data
  useEffect(() => {
    console.log("[BookingStoreSync] Pricing data received:", pricing);
    if (pricing) {
      setPricing(pricing);
      console.log("[BookingStoreSync] Updated store with pricing:", {
        minimumPrice: pricing.minimumPrice,
        afternoonWithoutKaraoke: pricing.afternoonWithoutKaraoke,
        afternoonWithKaraoke: pricing.afternoonWithKaraoke,
        loftPerPerson: pricing.loftPerPerson,
      });
    }
  }, [pricing, setPricing]);

  // Update store with availability data
  useEffect(() => {
    if (!availability) return;

    // Transform availability data to match expected store format
    const transformedSlots = availability.map((dateAvailability) => ({
      date: dateAvailability.date,
      timeSlots: dateAvailability.availableSlots,
    }));

    console.log("[BookingStoreSync] Availability data received:", {
      dates: availability.length,
      slots: transformedSlots.reduce(
        (acc, curr) => acc + curr.timeSlots.length,
        0,
      ),
    });

    setAvailability(transformedSlots);
  }, [availability, setAvailability]);

  return null;
}
