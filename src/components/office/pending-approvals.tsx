import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { formatPrice } from "@/lib/utils";
import { BookingDoc } from "@/lib/types";
import { useState } from "react";
import { BookingDetailsDialog } from "./booking-details-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

export function PendingApprovals() {
  const bookings = useQuery(api.get_functions.getPendingBookings);
  const products = useQuery(api.products.getProducts, {
    onlyVisible: true,
  });
  const [selectedBooking, setSelectedBooking] = useState<BookingDoc | null>(
    null,
  );
  const isMobile = useIsMobile();

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">אין הזמנות ממתינות לאישור</p>
        </CardContent>
      </Card>
    );
  }

  // Helper function to get selected product names
  const getSelectedProductNames = (booking: BookingDoc) => {
    if (!products || !booking.selectedProducts) return [];

    return booking.selectedProducts
      .map((selection) => {
        const product = products.find((p) => p._id === selection.productId);
        return product?.nameHe || "מוצר לא ידוע";
      })
      .filter((name) => name !== "מוצר לא ידוע");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>הזמנות ממתינות לאישור</CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <div className="flex flex-col gap-4">
              {bookings.map((booking) => {
                const isAfternoon = booking.timeSlot === "afternoon";
                const isLargeAfternoonGroup =
                  isAfternoon && booking.numberOfParticipants > 25;
                const selectedProductNames = getSelectedProductNames(booking);

                return (
                  <div
                    key={booking._id}
                    className="rounded border bg-card p-4 flex flex-col gap-2 shadow cursor-pointer overflow-hidden min-w-0"
                    style={{ minWidth: 0, maxWidth: "100%" }}
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <div className="flex flex-wrap items-center gap-2 min-w-0 w-full">
                      <span className="font-bold text-lg truncate max-w-[70%]">
                        {booking.customerName}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                        {format(new Date(booking.eventDate), "dd/MM/yyyy", {
                          locale: he,
                        })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs min-w-0 w-full">
                      <span className="truncate">
                        משתתפים: {booking.numberOfParticipants}
                      </span>
                      <span className="truncate">
                        סכום: ₪{formatPrice(booking.totalPrice)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs min-w-0 w-full">
                      {[
                        {
                          label: isAfternoon ? "צהריים" : "ערב",
                          color: "outline" as const,
                        },
                        ...(isLargeAfternoonGroup || booking.includesKaraoke
                          ? [{ label: "קריוקי", color: "secondary" as const }]
                          : []),
                        ...(booking.includesPhotographer
                          ? [{ label: "צלם", color: "secondary" as const }]
                          : []),
                        ...selectedProductNames.map((name) => ({
                          label: name,
                          color: "secondary" as const,
                        })),
                      ].map((tag, i) => (
                        <span key={i} className="truncate max-w-[60px] block">
                          <Badge
                            variant={tag.color}
                            className="text-xs w-full block truncate max-w-[60px]"
                          >
                            {tag.label}
                          </Badge>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>תאריך אירוע</TableHead>
                  <TableHead>שם לקוח</TableHead>
                  <TableHead>זמן</TableHead>
                  <TableHead>משתתפים</TableHead>
                  <TableHead>שירותים</TableHead>
                  <TableHead>סה"כ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => {
                  const isAfternoon = booking.timeSlot === "afternoon";
                  const isLargeAfternoonGroup =
                    isAfternoon && booking.numberOfParticipants > 25;
                  const selectedProductNames = getSelectedProductNames(booking);

                  return (
                    <TableRow
                      key={booking._id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <TableCell>
                        {format(new Date(booking.eventDate), "dd/MM/yyyy", {
                          locale: he,
                        })}
                      </TableCell>
                      <TableCell>{booking.customerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {isAfternoon ? "צהריים" : "ערב"}
                        </Badge>
                      </TableCell>
                      <TableCell>{booking.numberOfParticipants}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {(isLargeAfternoonGroup ||
                            booking.includesKaraoke) && (
                            <Badge variant="secondary" className="text-xs">
                              קריוקי
                            </Badge>
                          )}
                          {booking.includesPhotographer && (
                            <Badge variant="secondary" className="text-xs">
                              צלם
                            </Badge>
                          )}
                          {selectedProductNames.map((name, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>₪{formatPrice(booking.totalPrice)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <BookingDetailsDialog
        open={selectedBooking !== null}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
        booking={selectedBooking}
      />
    </>
  );
}
