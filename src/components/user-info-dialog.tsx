"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

    // Prepare complete booking data for submission
    const completeBookingData = {
      ...bookingData,
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      customerPhone: values.customerPhone,
      createdAt: Date.now(),
    };

    // Save complete booking data to session storage
    sessionStorage.setItem(
      "completeBookingData",
      JSON.stringify(completeBookingData),
    );

    // Simulate API call (replace with actual API call)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Complete booking data:", completeBookingData);

    setIsSubmitting(false);
    setBookingSuccess(true);

    toast.success("ההזמנה התקבלה!", {
      description: "בקשתך נשלחה לאישור. נחזור אליך בהקדם.",
    });
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
      <DialogContent className="sm:max-w-md">
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
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                ההזמנה התקבלה!
              </DialogTitle>
              <DialogDescription>
                תודה! קיבלנו את בקשתך ונחזור אליך בהקדם לאישור ופרטי תשלום.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  מספר הזמנה: #
                  {Math.random().toString(36).substr(2, 9).toUpperCase()}
                </p>
              </div>
            </div>

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
