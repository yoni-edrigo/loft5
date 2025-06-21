"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useBookingStore } from "@/store/booking-store";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";

const formSchema = z.object({
  customerName: z.string().min(2, { message: "שם חייב להכיל לפחות 2 תווים" }),
  customerPhone: z.string().min(9, { message: "מספר טלפון לא תקין" }),
  customerEmail: z.string().email({ message: "כתובת אימייל לא תקינה" }),
});

interface UserInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserInfoDialog({ open, onOpenChange }: UserInfoDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const { setCustomerInfo, resetBooking } = useBookingStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
    },
  });

  const createBooking = useMutation(api.set_functions.createBooking);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    // Get booking data from session storage
    const bookingDataString = sessionStorage.getItem("bookingData");
    if (!bookingDataString) {
      toast.error("שגיאה", {
        description: "לא נמצאו פרטי הזמנה. נא לנסות שוב.",
      });
      setIsSubmitting(false);
      return;
    }

    const bookingData = JSON.parse(bookingDataString);

    // Update customer info in store
    setCustomerInfo({
      name: values.customerName,
      email: values.customerEmail,
      phone: values.customerPhone,
    });

    try {
      // Submit booking to Convex
      await createBooking({
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone,
        eventDate: bookingData.selectedDate,
        timeSlot: bookingData.selectedTimeSlot,
        numberOfParticipants: bookingData.numberOfParticipants,
        extraHours: bookingData.extraHours || 0,
        includesKaraoke: false,
        includesPhotographer: false,
        selectedProducts: bookingData.selectedProducts || [],
        totalPrice: bookingData.totalPrice,
      });

      setBookingSuccess(true);
      toast.success("ההזמנה התקבלה!", {
        description: "בקשתך נשלחה לאישור. נחזור אליך בהקדם.",
      });
    } catch (error) {
      console.error("Failed to create booking:", error);
      toast.error("שגיאה", {
        description: "אירעה שגיאה בשליחת ההזמנה. נא לנסות שוב.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleNewBooking = () => {
    setBookingSuccess(false);
    onOpenChange(false);
    resetBooking();
    form.reset();
    sessionStorage.removeItem("bookingData");
    sessionStorage.removeItem("completeBookingData");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" style={{ direction: "rtl" }}>
        {!bookingSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>פרטי התקשרות</DialogTitle>
              <DialogDescription>
                אנא מלא את פרטיך כדי שנוכל ליצור איתך קשר בנוגע להזמנה
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void form.handleSubmit(onSubmit)(e);
                }}
              >
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel>שם מלא</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ישראל ישראלי"
                            {...field}
                            className="text-right"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel>טלפון</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="050-1234567"
                            {...field}
                            className="text-right"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel>אימייל</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="example@example.com"
                            {...field}
                            className="text-right"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="sm:justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      ביטול
                    </Button>
                    <Button
                      type="submit"
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "שולח..." : "שלח הזמנה"}
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-status-available" />
                ההזמנה התקבלה!
              </DialogTitle>
              <DialogDescription className="text-start">
                תודה! קיבלנו את בקשתך ונחזור אליך בהקדם לאישור ופרטי תשלום.
              </DialogDescription>
            </DialogHeader>

            <DialogDescription className="text-start">
              אם יש לך שאלות נוספות, אתה מוזמן ליצור איתנו קשר ב:
              <br />
              <strong>טלפון:</strong> 050-1234567
              <br />
            </DialogDescription>

            <DialogFooter>
              <Button onClick={handleNewBooking} className="w-full">
                הזמנה חדשה
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
