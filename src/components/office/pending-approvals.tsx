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

export function PendingApprovals() {
  const bookings = useQuery(api.get_functions.getPendingBookings);
  const [selectedBooking, setSelectedBooking] = useState<BookingDoc | null>(
    null,
  );

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">אין הזמנות הממתינות לאישור</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>הזמנות הממתינות לאישור</CardTitle>
        </CardHeader>
        <CardContent>
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
                        {(isLargeAfternoonGroup || booking.includesKaraoke) && (
                          <Badge variant="secondary" className="text-xs">
                            קריוקי
                          </Badge>
                        )}
                        {booking.includesPhotographer && (
                          <Badge variant="secondary" className="text-xs">
                            צלם
                          </Badge>
                        )}
                        {booking.includesFood && (
                          <Badge variant="secondary" className="text-xs">
                            אוכל
                          </Badge>
                        )}
                        {booking.includesDrinks && (
                          <Badge variant="secondary" className="text-xs">
                            משקאות
                          </Badge>
                        )}
                        {booking.includesSnacks && (
                          <Badge variant="secondary" className="text-xs">
                            חטיפים
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>₪{formatPrice(booking.totalPrice)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
