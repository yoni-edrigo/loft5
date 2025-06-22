import { BookingDoc } from "@/lib/types";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { formatPrice } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar, Users, Clock } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface BookingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingDoc | null;
}

export function BookingDetailsDialog({
  open,
  onOpenChange,
  booking,
}: BookingDetailsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [markAsPaid, setMarkAsPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Get all products to display selected product names
  const products = useQuery(api.products.getProducts, {
    onlyVisible: true,
  });

  const approveBooking = useMutation(api.set_functions.approveBooking);
  const declineBooking = useMutation(api.set_functions.declineBooking);

  if (!booking) return null;

  const isAfternoon = booking.timeSlot === "afternoon";
  const isLargeAfternoonGroup =
    isAfternoon && booking.numberOfParticipants > 25;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const args: any = { id: booking._id };
      if (markAsPaid && paymentMethod) {
        args.paidAt = Date.now();
        args.paymentMethod = paymentMethod;
      }
      await approveBooking(args);
      toast.success("ההזמנה אושרה בהצלחה!");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to approve booking:", error);
      toast.error("שגיאה", {
        description: "אירעה שגיאה באישור ההזמנה. נא לנסות שוב.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setIsSubmitting(true);
    try {
      await declineBooking({ id: booking._id });
      toast.success("ההזמנה נדחתה בהצלחה!");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to decline booking:", error);
      toast.error("שגיאה", {
        description: "אירעה שגיאה בדחיית ההזמנה. נא לנסות שוב.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!markAsPaid || !paymentMethod) {
      toast.error("נא לבחור אמצעי תשלום");
      return;
    }

    setIsSubmitting(true);
    try {
      await approveBooking({
        id: booking._id,
        paidAt: Date.now(),
        paymentMethod,
      });
      toast.success("התשלום סומן בהצלחה!");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to mark booking as paid:", error);
      toast.error("שגיאה", {
        description: "אירעה שגיאה בסימון התשלום. נא לנסות שוב.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get selected product details
  const getSelectedProductDetails = () => {
    if (!products || !booking.selectedProducts) return [];

    return booking.selectedProducts
      .map((selection) => {
        const product = products.find((p) => p._id === selection.productId);
        return {
          product,
          quantity: selection.quantity,
          price: product ? product.price * (selection.quantity || 1) : 0,
        };
      })
      .filter((item) => item.product); // Only return items with valid products
  };

  const selectedProductDetails = getSelectedProductDetails();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ direction: "rtl" }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">פרטי הזמנה</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="סטטוס תשלום" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="paid">שולם</SelectItem>
              <SelectItem value="unpaid">לא שולם</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardContent className="space-y-6 ">
          {/* Customer Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4" />
              <span className="font-medium">פרטי לקוח</span>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>שם:</span>
                <span className="font-medium">{booking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>טלפון:</span>
                <span className="font-medium" dir="ltr">
                  {booking.customerPhone}
                </span>
              </div>
              <div className="flex justify-between">
                <span>אימייל:</span>
                <span className="font-medium" dir="ltr">
                  {booking.customerEmail}
                </span>
              </div>
            </div>
          </div>

          <Separator />

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
                  {format(new Date(booking.eventDate), "dd/MM/yyyy", {
                    locale: he,
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>שעת התחלה:</span>
                <span className="font-medium">{booking.startTime}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>זמן:</span>
                <Badge variant="secondary">
                  {isAfternoon ? "צהריים (12:00-16:00)" : "ערב (18:00-22:00)"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span>משתתפים:</span>
                <span className="font-medium">
                  {booking.numberOfParticipants}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>שעות נוספות:</span>
                <span className="font-medium">{booking.extraHours ?? 0}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Services */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4" />
              <span className="font-medium">שירותים נבחרים</span>
            </div>
            <div className="space-y-2">
              {/* Legacy boolean fields (for backward compatibility) */}
              {(isLargeAfternoonGroup || booking.includesKaraoke) && (
                <Badge variant="default">
                  קריוקי
                  {isLargeAfternoonGroup && (
                    <span className="ml-1">(חובה)</span>
                  )}
                </Badge>
              )}

              {booking.includesPhotographer && (
                <Badge variant="default">צלם</Badge>
              )}

              {/* New dynamic product selections */}
              {selectedProductDetails.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    מוצרים נבחרים:
                  </div>
                  {selectedProductDetails.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>
                        {item.product?.nameHe}
                        {item.quantity && item.quantity > 1 && (
                          <span className="text-muted-foreground">
                            {" "}
                            (x{item.quantity})
                          </span>
                        )}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.price)} ₪
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {!isLargeAfternoonGroup &&
                !booking.includesKaraoke &&
                !booking.includesPhotographer &&
                selectedProductDetails.length === 0 && (
                  <span className="text-muted-foreground">
                    לא נבחרו שירותים נוספים
                  </span>
                )}
            </div>
          </div>

          <Separator />

          {/* Total Price */}
          <div className="text-center p-4 rounded-md bg-primary text-primary-foreground">
            <div className="text-sm mb-1">סה"כ לתשלום</div>
            <div className="text-2xl font-bold">
              {formatPrice(booking.totalPrice)} ₪
            </div>
            <div className="mt-2">
              {booking.paidAt ? (
                <Badge className="bg-green-500 text-white">שולם</Badge>
              ) : (
                <Badge variant="destructive">לא שולם</Badge>
              )}
            </div>
          </div>

          {/* Payment Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-medium">סטטוס תשלום</span>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              {booking.paidAt ? (
                <div className="flex justify-between">
                  <span>שולם בתאריך:</span>
                  <span className="font-medium">
                    {format(new Date(booking.paidAt), "dd/MM/yyyy HH:mm", {
                      locale: he,
                    })}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={markAsPaid}
                      onChange={(e) => setMarkAsPaid(e.target.checked)}
                      disabled={isSubmitting}
                    />
                    סמן כשולם
                  </label>
                  {markAsPaid && (
                    <div>
                      <label className="block mb-1">אמצעי תשלום:</label>
                      <select
                        className="w-full border rounded p-2"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        disabled={isSubmitting}
                      >
                        <option value="">בחר אמצעי תשלום</option>
                        <option value="cash">מזומן</option>
                        <option value="credit">אשראי</option>
                        <option value="transfer">העברה בנקאית</option>
                        <option value="check">צ'ק</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!booking.approvedAt && !booking.declinedAt && (
            <div className="flex gap-2">
              <Button
                onClick={() => void handleApprove()}
                disabled={isSubmitting}
                className="flex-1"
              >
                אישור
              </Button>
              <Button
                onClick={() => void handleDecline()}
                disabled={isSubmitting}
                variant="destructive"
                className="flex-1"
              >
                דחייה
              </Button>
            </div>
          )}

          {/* Payment Button */}
          {booking.approvedAt && !booking.paidAt && (
            <Button
              onClick={() => void handleMarkAsPaid()}
              disabled={isSubmitting || !markAsPaid || !paymentMethod}
              className="w-full"
            >
              סמן כשולם
            </Button>
          )}

          {/* Status Display */}
          {booking.approvedAt && (
            <div className="text-center">
              <Badge className="bg-green-500 text-white">
                אושר בתאריך{" "}
                {format(new Date(booking.approvedAt), "dd/MM/yyyy", {
                  locale: he,
                })}
              </Badge>
            </div>
          )}

          {booking.declinedAt && (
            <div className="text-center">
              <Badge variant="destructive">
                נדחה בתאריך{" "}
                {format(new Date(booking.declinedAt), "dd/MM/yyyy", {
                  locale: he,
                })}
              </Badge>
            </div>
          )}
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}
