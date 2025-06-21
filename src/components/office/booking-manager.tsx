import { useQuery, useMutation } from "convex/react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "motion/react";
import { BookingDoc } from "@/lib/types";
import { Check } from "lucide-react";
import { toast } from "sonner";

interface BookingManagerProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  selectedBookingId?: string | null;
  setSelectedBookingId: (id: string | null) => void;
}

// --- SwipeableBookingCard Component ---
interface SwipeableBookingCardProps {
  booking: BookingDoc;
  onSelect: (id: string) => void;
}

const SwipeableBookingCard = ({
  booking,
  onSelect,
}: SwipeableBookingCardProps) => {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const approveBooking = useMutation(api.set_functions.approveBooking);
  const declineBooking = useMutation(api.set_functions.declineBooking);

  const handleSwipe = (offsetX: number) => {
    if (booking.approvedAt || booking.declinedAt) {
      void controls.start({ x: 0 });
      return;
    }

    if (offsetX > 100) {
      // Swipe right (Approve)
      void controls.start({ x: "100%", opacity: 0 });
      approveBooking({ id: booking._id })
        .then(() => {
          toast.success("ההזמנה אושרה");
        })
        .catch(() => {
          toast.error("שגיאה באישור ההזמנה");
          void controls.start({ x: 0, opacity: 1 });
        });
    } else if (offsetX < -100) {
      // Swipe left (Decline)
      void controls.start({ x: "-100%", opacity: 0 });
      declineBooking({ id: booking._id })
        .then(() => {
          toast.success("ההזמנה נדחתה");
        })
        .catch(() => {
          toast.error("שגיאה בדחיית ההזמנה");
          void controls.start({ x: 0, opacity: 1 });
        });
    } else {
      void controls.start({ x: 0 });
    }
  };

  const background = useTransform(
    x,
    [-100, 0, 100],
    [
      "rgba(239, 68, 68, 0.7)",
      "rgba(255, 255, 255, 0)",
      "rgba(34, 197, 94, 0.7)",
    ],
  );

  const isAfternoon = booking.timeSlot === "afternoon";
  const isApproved = !!booking.approvedAt;
  const isDeclined = !!booking.declinedAt;
  const isPending = !isApproved && !isDeclined;

  return (
    <div className="relative">
      {isPending && (
        <motion.div
          style={{ background }}
          className="absolute inset-0 rounded-lg flex items-center justify-between px-4"
        >
          <div className="flex items-center gap-2 text-white font-bold">
            <X size={20} />
            <span>דחייה</span>
          </div>
          <div className="flex items-center gap-2 text-white font-bold">
            <span>אישור</span>
            <Check size={20} />
          </div>
        </motion.div>
      )}

      <motion.div
        drag={isPending ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x }}
        onDragEnd={(_, info) => handleSwipe(info.offset.x)}
        animate={controls}
        className="relative z-10 rounded border bg-card p-4 flex flex-col gap-2 shadow cursor-pointer"
        onClick={() => onSelect(booking._id)}
      >
        <div className="flex flex-col items-end gap-1 w-full">
          <span className="font-bold text-lg leading-tight truncate w-full text-right">
            {booking.customerName}
          </span>
          <span className="text-xs text-muted-foreground w-full text-right">
            {format(new Date(booking.eventDate), "dd/MM/yyyy", {
              locale: he,
            })}
          </span>
        </div>
        <div className="flex flex-row justify-between items-center gap-2 text-xs w-full">
          <span className="truncate">
            משתתפים: {booking.numberOfParticipants}
          </span>
          <span className="truncate">
            סכום: ₪{formatPrice(booking.totalPrice)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs w-full mt-1">
          <Badge variant="outline" className="truncate max-w-[80px] px-2 py-1">
            {isAfternoon ? "צהריים" : "ערב"}
          </Badge>
          <Badge
            variant={
              isApproved ? "default" : isDeclined ? "destructive" : "secondary"
            }
            className="truncate max-w-[90px] px-2 py-1"
          >
            {isApproved ? "מאושרת" : isDeclined ? "נדחתה" : "ממתינה לאישור"}
          </Badge>
          {booking.paidAt ? (
            <Badge className="bg-status-available text-white truncate max-w-[80px] px-2 py-1">
              שולם
            </Badge>
          ) : (
            <Badge
              variant="destructive"
              className="truncate max-w-[80px] px-2 py-1"
            >
              לא שולם
            </Badge>
          )}
        </div>
      </motion.div>
    </div>
  );
};

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

  const isMobile = useIsMobile();

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

          {isMobile ? (
            <div className="flex flex-col gap-4">
              {filteredBookings.length === 0 ? (
                <div className="text-center h-32 text-muted-foreground">
                  לא נמצאו הזמנות
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <SwipeableBookingCard
                    key={booking._id}
                    booking={booking}
                    onSelect={setSelectedBookingId}
                  />
                ))
              )}
            </div>
          ) : (
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
          )}
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
