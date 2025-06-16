import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { formatPrice } from "@/lib/utils";
import { BookingDetailsDialog } from "./booking-details-dialog";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CalendarIcon, Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState } from "react";

interface BookingManagerProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  selectedBookingId?: string | null;
  setSelectedBookingId: (id: string | null) => void;
}

export function BookingManager({
  selectedTab,
  setSelectedTab,
  selectedBookingId,
  setSelectedBookingId,
}: BookingManagerProps) {
  const [nameFilter, setNameFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  // Query all bookings
  const bookings = useQuery(api.get_functions.getAllBookings) || [];

  // Find the selected booking by ID
  const selectedBooking =
    selectedBookingId && bookings
      ? bookings.find((b) => b._id === selectedBookingId) || null
      : null;

  // Filter bookings based on current tab, name, date, and payment status
  const filteredBookings = bookings.filter((booking) => {
    // First filter by status
    const matchesStatus =
      selectedTab === "all" ||
      (selectedTab === "pending" &&
        !booking.approvedAt &&
        !booking.declinedAt) ||
      (selectedTab === "approved" && booking.approvedAt) ||
      (selectedTab === "declined" && booking.declinedAt);

    // Then filter by name if there's a name filter
    const matchesName = nameFilter
      ? booking.customerName.toLowerCase().includes(nameFilter.toLowerCase())
      : true;

    // Then filter by date if there's a date filter
    const matchesDate = selectedDate
      ? booking.eventDate === format(selectedDate, "yyyy-MM-dd")
      : true;

    // Then filter by payment status
    const matchesPayment =
      paymentFilter === "all" ||
      (paymentFilter === "paid" && booking.paidAt) ||
      (paymentFilter === "unpaid" && !booking.paidAt);

    return matchesStatus && matchesName && matchesDate && matchesPayment;
  });

  const clearFilters = () => {
    setNameFilter("");
    setSelectedDate(undefined);
    setPaymentFilter("all");
  };

  const hasFilters = nameFilter || selectedDate || paymentFilter !== "all";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>הזמנות</CardTitle>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש לפי שם"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="pl-3 pr-9 w-[200px]"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={selectedDate ? "default" : "outline"}
                  className="gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "dd/MM/yyyy", { locale: he })
                    : "בחר תאריך"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

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

            {hasFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-9 px-2"
                title="נקה סינון"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} dir="rtl">
          <ScrollArea>
            <TabsList className="text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1">
              <TabsTrigger
                value="pending"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                ממתינות לאישור
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                מאושרות
              </TabsTrigger>
              <TabsTrigger
                value="declined"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                נדחו
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                הכל
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>תאריך אירוע</TableHead>
                  <TableHead>שם לקוח</TableHead>
                  <TableHead>זמן</TableHead>
                  <TableHead>משתתפים</TableHead>
                  <TableHead>סה"כ</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>סטטוס תשלום</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center h-32 text-muted-foreground"
                    >
                      לא נמצאו הזמנות
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => {
                    const isAfternoon = booking.timeSlot === "afternoon";
                    const isApproved = !!booking.approvedAt;
                    const isDeclined = !!booking.declinedAt;

                    return (
                      <TableRow
                        key={booking._id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedBookingId(booking._id)}
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
                          ₪{formatPrice(booking.totalPrice)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              isApproved
                                ? "default"
                                : isDeclined
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {isApproved
                              ? "מאושרת"
                              : isDeclined
                                ? "נדחתה"
                                : "ממתינה לאישור"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {booking.paidAt ? (
                            <Badge className="bg-status-available text-white">
                              שולם
                            </Badge>
                          ) : (
                            <Badge variant="destructive">לא שולם</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Tabs>
      </CardContent>

      <BookingDetailsDialog
        open={!!selectedBooking}
        onOpenChange={(open) => {
          if (!open) setSelectedBookingId(null);
        }}
        booking={selectedBooking}
      />
    </Card>
  );
}
