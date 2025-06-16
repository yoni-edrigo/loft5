import { SignInForm } from "@/components/auth/sign-in-form";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";

import { BookingManager } from "@/components/office/booking-manager";
import { FcmTokenRegistrar } from "@/components/office/fcm-token-registrar";
import { OfficeNavbar } from "@/components/office/office-navbar";

export const Route = createFileRoute("/office")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as string) || "pending",
      bookingId: search.bookingId as string,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { tab, bookingId } = useSearch({ from: "/office" });
  const navigate = useNavigate();

  // Handlers to update search params
  const setTab = (newTab: string) => {
    void navigate({
      search: { tab: newTab, bookingId } as any,
      replace: true,
    });
  };
  const setBookingId = (id: string | null) => {
    if (id) {
      void navigate({
        search: { tab, bookingId: id } as any,
        replace: true,
      });
    } else {
      void navigate({
        search: { tab } as any,
        replace: true,
      });
    }
  };

  return (
    <>
      <OfficeNavbar />
      <Authenticated>
        <div className="container mx-auto pb-8 px-4">
          <h1 className="text-3xl font-bold text-center mb-8">ניהול הזמנות</h1>
          <FcmTokenRegistrar />
          <BookingManager
            selectedTab={tab}
            setSelectedTab={setTab}
            selectedBookingId={bookingId}
            setSelectedBookingId={setBookingId}
          />
        </div>
      </Authenticated>
      <Unauthenticated>
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-center mb-8">התחברות למשרד</h1>
          <SignInForm />
        </div>
      </Unauthenticated>
    </>
  );
}
