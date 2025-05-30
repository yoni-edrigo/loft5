"use client";

import { motion } from "motion/react";
import { useBookingStore } from "@/store/booking-store";
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
  Music,
  Plus,
  UtensilsCrossed,
  Wine,
  Cookie,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function BookingOptions() {
  const {
    pricing,
    selectedTimeSlot,
    numberOfParticipants,
    extraHours,
    includesKaraoke,
    includesPhotographer,
    includesFood,
    includesDrinks,
    includesSnacks,
    setNumberOfParticipants,
    setExtraHours,
    setIncludesKaraoke,
    setIncludesPhotographer,
    setIncludesFood,
    setIncludesDrinks,
    setIncludesSnacks,
  } = useBookingStore();

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

          {/* Food & Drinks Options */}
          <div className="space-y-4">
            <Label className="text-base">אוכל ומשקאות (אופציונלי)</Label>

            {/* Food */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium">אוכל</div>
                  <div className="text-sm text-muted-foreground">
                    ארוחה מלאה לכל משתתף
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  ₪{formatPrice(pricing.foodPerPerson)} לאדם
                </span>
                <Switch
                  checked={includesFood}
                  onCheckedChange={setIncludesFood}
                />
              </div>
            </div>

            {/* Drinks */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Wine className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium">משקאות</div>
                  <div className="text-sm text-muted-foreground">
                    משקאות אלכוהוליים ולא אלכוהוליים
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  ₪{formatPrice(pricing.drinksPerPerson)} לאדם
                </span>
                <Switch
                  checked={includesDrinks}
                  onCheckedChange={setIncludesDrinks}
                />
              </div>
            </div>

            {/* Snacks */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Cookie className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium">חטיפים</div>
                  <div className="text-sm text-muted-foreground">
                    חטיפים מלוחים ומתוקים
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  ₪{formatPrice(pricing.snacksPerPerson)} לאדם
                </span>
                <Switch
                  checked={includesSnacks}
                  onCheckedChange={setIncludesSnacks}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Add-ons */}
          <div className="space-y-4">
            <Label className="text-base">תוספות נוספות</Label>

            {/* Karaoke (Afternoon only and not large group) */}
            {isAfternoon && numberOfParticipants <= 25 && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Music className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">קריוקי</div>
                    <div className="text-sm text-muted-foreground">
                      מערכת קריוקי מקצועית
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    ₪
                    {formatPrice(
                      pricing.afternoonWithKaraoke -
                        pricing.afternoonWithoutKaraoke,
                    )}
                  </span>
                  <Switch
                    checked={includesKaraoke}
                    onCheckedChange={setIncludesKaraoke}
                  />
                </div>
              </div>
            )}

            {/* Photographer */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Camera className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">צלם מקצועי</div>
                  <div className="text-sm text-muted-foreground">
                    צילום מקצועי לאורך האירוע
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  ₪{formatPrice(pricing.photographerPrice)}
                </span>
                <Switch
                  checked={includesPhotographer}
                  onCheckedChange={setIncludesPhotographer}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
