"use client";

import { motion } from "motion/react";
import { useBookingStore } from "@/store/booking-store";
import type { ProductDoc } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Clock,
  Camera,
  Plus,
  UtensilsCrossed,
  Wine,
  Cookie,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Id } from "../../convex/_generated/dataModel";

export default function BookingOptions() {
  const {
    pricing,
    products,
    selectedTimeSlot,
    numberOfParticipants,
    extraHours,
    packageSelections,
    setNumberOfParticipants,
    setExtraHours,
    selectProduct,
    addStandaloneProduct,
    removeStandaloneProduct,
    isProductSelected,
  } = useBookingStore();

  // Filter products by category and slot
  const slotFilter = (p: ProductDoc) => {
    if (!selectedTimeSlot) return true;
    return !p.availableSlots || p.availableSlots.includes(selectedTimeSlot);
  };
  const safeProducts = products ?? [];
  const foodPackages = safeProducts.filter(
    (p) =>
      p.category === "food_package" &&
      p.packageKey === "food_package" &&
      slotFilter(p),
  );
  const drinksPackages = safeProducts.filter(
    (p) =>
      p.category === "drinks_package" &&
      p.packageKey === "drinks_package" &&
      slotFilter(p),
  );
  const snacks = safeProducts.filter(
    (p) => p.category === "snacks" && slotFilter(p),
  );
  const addons = safeProducts.filter(
    (p) => p.category === "addons" && slotFilter(p),
  );

  if (!selectedTimeSlot || !pricing) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            בחר תאריך ושעות כדי להתאים את האירוע
          </p>
        </CardContent>
      </Card>
    );
  }

  const isAfternoon = selectedTimeSlot === "afternoon";
  const isEvening = selectedTimeSlot === "evening";
  const isLargeAfternoonGroup = isAfternoon && numberOfParticipants > 25;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            התאמת האירוע
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Number of Participants */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-base">מספר משתתפים</Label>
              <motion.span
                key={numberOfParticipants}
                initial={{ scale: 1.2, color: "#1E3A8A" }}
                animate={{ scale: 1, color: "inherit" }}
                className="font-medium text-lg"
              >
                {numberOfParticipants}
              </motion.span>
            </div>

            <Slider
              min={1}
              max={50}
              step={1}
              value={[numberOfParticipants]}
              onValueChange={(value) => setNumberOfParticipants(value[0])}
              className="py-4"
            />

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1</span>
              <span>50</span>
            </div>

            {isAfternoon && numberOfParticipants > 25 && (
              <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  לקבוצות מעל 25 משתתפים, חדר הקריוקי ייפתח אוטומטית (₪1500)
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Time Slot Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <Label className="text-base">פרטי הזמן</Label>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>סוג אירוע:</span>
                <Badge variant="secondary">
                  {isAfternoon ? "צהריים" : "ערב"}
                </Badge>
              </div>

              <div className="flex justify-between">
                <span>שעות בסיס:</span>
                <span className="font-medium">
                  {isAfternoon
                    ? "4 שעות (12:00-16:00)"
                    : "4 שעות (18:00-22:00)"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>מחיר בסיס:</span>
                <span className="font-medium">
                  {isAfternoon
                    ? isLargeAfternoonGroup
                      ? `₪${formatPrice(pricing.afternoonWithKaraoke)}`
                      : `₪${formatPrice(pricing.afternoonWithoutKaraoke)}`
                    : `₪${formatPrice(pricing.loftPerPerson)} לאדם (חלל בלבד)`}
                </span>
              </div>
            </div>
          </div>

          {/* Extra Hours (Evening only) */}
          {isEvening && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <Label className="text-base">שעות נוספות</Label>
                  </div>
                  <motion.span
                    key={extraHours}
                    initial={{ scale: 1.2, color: "#1E3A8A" }}
                    animate={{ scale: 1, color: "inherit" }}
                    className="font-medium"
                  >
                    {extraHours} שעות
                  </motion.span>
                </div>

                <Slider
                  min={0}
                  max={4}
                  step={1}
                  value={[extraHours]}
                  onValueChange={(value) => setExtraHours(value[0])}
                  className="py-4"
                />

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>ללא תוספת</span>
                  <span>עד 4 שעות נוספות</span>
                </div>

                {extraHours > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      תוספת של {extraHours} שעות: ₪
                      {formatPrice(pricing.extraHourPerPerson)} לאדם לשעה
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Food & Drinks Options (Dynamic) */}
          <div className="space-y-4">
            <Label className="text-base">אוכל ומשקאות (אופציונלי)</Label>

            {/* Food Package Radio Group */}
            {foodPackages.length > 0 && (
              <div className="p-4 border rounded-lg">
                <div className="font-medium mb-2 flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-orange-600" />
                  חבילת אוכל
                </div>
                <RadioGroup
                  value={packageSelections.get("food_package")?.productId || ""}
                  onValueChange={(val) =>
                    selectProduct("food_package", val as Id<"products">)
                  }
                  className="flex flex-col gap-2"
                >
                  {foodPackages.map((p) => (
                    <Label key={p._id} className="flex items-center gap-2">
                      <RadioGroupItem value={p._id} />
                      <span className="font-medium">{p.nameHe}</span>
                      <span className="text-sm text-muted-foreground">
                        {p.descriptionHe}
                      </span>
                      <span className="ml-auto text-sm font-medium">
                        ₪{formatPrice(p.price)} לאדם
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Drinks Package Radio Group */}
            {drinksPackages.length > 0 && (
              <div className="p-4 border rounded-lg">
                <div className="font-medium mb-2 flex items-center gap-2">
                  <Wine className="h-5 w-5 text-purple-600" />
                  חבילת משקאות
                </div>
                <RadioGroup
                  value={
                    packageSelections.get("drinks_package")?.productId || ""
                  }
                  onValueChange={(val) =>
                    selectProduct("drinks_package", val as Id<"products">)
                  }
                  className="flex flex-col gap-2"
                >
                  {drinksPackages.map((p) => (
                    <Label key={p._id} className="flex items-center gap-2">
                      <RadioGroupItem value={p._id} />
                      <span className="font-medium">{p.nameHe}</span>
                      <span className="text-sm text-muted-foreground">
                        {p.descriptionHe}
                      </span>
                      <span className="ml-auto text-sm font-medium">
                        ₪{formatPrice(p.price)} לאדם
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Snacks Switches */}
            {snacks.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Cookie className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="font-medium">{p.nameHe}</div>
                    <div className="text-sm text-muted-foreground">
                      {p.descriptionHe}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    ₪{formatPrice(p.price)} לאדם
                  </span>
                  <Switch
                    checked={isProductSelected(p._id)}
                    onCheckedChange={(checked) =>
                      checked
                        ? addStandaloneProduct(p._id)
                        : removeStandaloneProduct(p._id)
                    }
                  />
                </div>
              </div>
            ))}

            {/* Add-ons Switches */}
            {addons.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Camera className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">{p.nameHe}</div>
                    <div className="text-sm text-muted-foreground">
                      {p.descriptionHe}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    ₪{formatPrice(p.price)}
                  </span>
                  <Switch
                    checked={isProductSelected(p._id)}
                    onCheckedChange={(checked) =>
                      checked
                        ? addStandaloneProduct(p._id)
                        : removeStandaloneProduct(p._id)
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />
        </CardContent>
      </Card>
    </motion.div>
  );
}
