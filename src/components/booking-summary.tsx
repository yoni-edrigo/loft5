"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useBookingStore } from "@/store/booking-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Calendar, Calculator } from "lucide-react";
import { UserInfoDialog } from "@/components/user-info-dialog";
import { toast } from "sonner";

export default function BookingSummary() {
  const [showUserInfoDialog, setShowUserInfoDialog] = useState(false);

  const {
    pricing,
    products,
    selectedDate,
    selectedTimeSlot,
    numberOfParticipants,
    extraHours,
    selectedProducts,
    packageSelections,
    calculateTotalPrice,
    selectedStartTime,
  } = useBookingStore();

  if (!selectedDate || !selectedTimeSlot || !pricing) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">בחר תאריך ושעות לצפייה במחיר</p>
        </CardContent>
      </Card>
    );
  }

  const isAfternoon = selectedTimeSlot === "afternoon";
  const isEvening = selectedTimeSlot === "evening";
  const isLargeAfternoonGroup = isAfternoon && numberOfParticipants > 25;
  const totalPrice = calculateTotalPrice();

  // Calculate price breakdown
  const getBasePrice = () => {
    if (isAfternoon) {
      if (numberOfParticipants > 25) {
        return pricing.afternoonWithKaraoke; // Large groups require karaoke
      }
      return pricing.afternoonWithoutKaraoke;
    } else {
      return pricing.loftPerPerson * numberOfParticipants;
    }
  };

  const getExtraHoursPrice = () => {
    if (isEvening && extraHours > 0) {
      return extraHours * pricing.extraHourPerPerson * numberOfParticipants;
    }
    return 0;
  };

  const basePrice = getBasePrice();
  const extraHoursPrice = getExtraHoursPrice();

  // Calculate product prices
  const getProductPrices = () => {
    const prices: { [key: string]: number } = {};
    let totalProductPrice = 0;

    // Calculate prices for all selected products
    selectedProducts.forEach((selection) => {
      const product = products?.find((p) => p._id === selection.productId);
      if (product) {
        const quantity = selection.quantity || numberOfParticipants;
        let price = 0;

        switch (product.unit) {
          case "per_person":
            price = product.price * quantity;
            break;
          case "per_event":
            price = product.price;
            break;
          case "per_hour":
            price = product.price * extraHours;
            break;
          case "flat":
            price = product.price;
            break;
        }

        prices[selection.productId] = price;
        totalProductPrice += price;
      }
    });

    return { prices, totalProductPrice };
  };

  const { prices: productPrices, totalProductPrice } = getProductPrices();

  // Check if minimum price is applied
  const calculatedPrice = basePrice + totalProductPrice + extraHoursPrice;
  const isMinimumPriceApplied =
    totalPrice === pricing.minimumPrice && totalPrice > calculatedPrice;

  const handleContinue = () => {
    if (!selectedDate || !selectedTimeSlot || !selectedStartTime) {
      toast.error("שגיאה", {
        description: "נא לבחור תאריך, שעות, ושעת התחלה לפני ההזמנה",
      });
      return;
    }

    // Debug logs to verify date handling
    console.log("Selected date (original):", selectedDate);
    console.log("Selected date (toISOString):", selectedDate.toISOString());
    console.log("Selected date (format):", format(selectedDate, "yyyy-MM-dd"));
    console.log("User timezone offset:", selectedDate.getTimezoneOffset());

    // Save booking data to session storage
    const bookingData = {
      selectedDate: format(selectedDate, "yyyy-MM-dd"),
      selectedTimeSlot,
      selectedStartTime,
      numberOfParticipants,
      extraHours,
      selectedProducts,
      packageSelections: Array.from(packageSelections.entries()),
      totalPrice,
      timestamp: Date.now(),
    };

    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

    // Open user info dialog
    setShowUserInfoDialog(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="sm:sticky sm:top-10"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            סיכום הזמנה
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">פרטי האירוע</span>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span>תאריך:</span>
                <span className="font-medium">
                  {format(selectedDate, "dd/MM/yyyy", { locale: he })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>זמן:</span>
                <Badge variant="secondary">
                  {isAfternoon ? "צהריים (12:00-16:00)" : "ערב (18:00-22:00)"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span>שעת התחלה:</span>
                <span className="font-medium">{selectedStartTime || "-"}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>משתתפים:</span>
                <span className="font-medium">{numberOfParticipants}</span>
              </div>

              {isEvening && extraHours > 0 && (
                <div className="flex justify-between items-center">
                  <span>שעות נוספות:</span>
                  <span className="font-medium">{extraHours}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Price Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-4 w-4" />
              <span className="font-medium">פירוט מחיר</span>
            </div>

            <div className="space-y-2">
              {/* Base price */}
              <div className="flex justify-between items-center">
                <span>
                  {isAfternoon
                    ? isLargeAfternoonGroup
                      ? `אירוע צהריים (מעל 25 איש)`
                      : `אירוע צהריים (חלל בלבד)`
                    : `חלל ערב (${numberOfParticipants} איש)`}
                </span>
                <span className="font-medium">{formatPrice(basePrice)} ₪</span>
              </div>

              {/* Products as a group */}
              {totalProductPrice > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center font-medium">
                    <span>שירותים נוספים:</span>
                    <span>{formatPrice(totalProductPrice)} ₪</span>
                  </div>

                  {/* Show selected products */}
                  {selectedProducts.map((selection) => {
                    const product = products?.find(
                      (p) => p._id === selection.productId,
                    );
                    if (product) {
                      return (
                        <div
                          key={selection.productId}
                          className="flex justify-between items-center text-sm text-muted-foreground"
                        >
                          <span className="mr-4">• {product.nameHe}</span>
                          <span>
                            {formatPrice(
                              productPrices[selection.productId] || 0,
                            )}{" "}
                            ₪
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}

              {/* Extra hours */}
              {extraHoursPrice > 0 && (
                <div className="flex justify-between items-center">
                  <span>שעות נוספות ({extraHours})</span>
                  <span className="font-medium">
                    {formatPrice(extraHoursPrice)} ₪
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Total */}
          <motion.div
            className="text-center p-4 rounded-md bg-primary text-primary-foreground"
            key={totalPrice}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-sm mb-1">סה"כ לתשלום</div>
            <div className="text-2xl sm:text-3xl font-bold">
              {formatPrice(totalPrice)} ₪
            </div>
            {isMinimumPriceApplied && (
              <div className="text-xs mt-1 opacity-90">
                (מחיר מינימום{" "}
                {isAfternoon
                  ? formatPrice(pricing.minimumPrice)
                  : formatPrice(pricing.minimumPrice)}{" "}
                ₪)
              </div>
            )}
          </motion.div>
        </CardContent>
        <CardFooter className="flex justify-center pt-2 pb-6">
          <Button
            onClick={handleContinue}
            size="lg"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            המשך להזמנה
          </Button>
        </CardFooter>
      </Card>

      {/* User Info Dialog */}
      <UserInfoDialog
        open={showUserInfoDialog}
        onOpenChange={setShowUserInfoDialog}
      />
    </motion.div>
  );
}
