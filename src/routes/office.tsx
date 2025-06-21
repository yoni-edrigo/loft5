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
import { useUserRoles } from "@/hooks/useUserRoles";
import { useEffect } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";

export const Route = createFileRoute("/office")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as string) || "pending",
      bookingId:
        typeof search.bookingId === "string" ? search.bookingId : undefined,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { tab, bookingId } = useSearch({ from: "/office" });
  const navigate = useNavigate();
  const roles = useUserRoles();

  // Redirect if user has a more appropriate role
  useEffect(() => {
    if (roles && !roles.includes("MANAGER") && !roles.includes("ADMIN")) {
      if (roles.includes("DESIGNER")) {
        void navigate({ to: "/site-design", search: { tab: "services" } });
      } else if (roles.includes("ADMIN")) {
        void navigate({
          to: "/site-control",
          search: {
            tab: "pricing",
            searchTerm: undefined,
            categoryFilter: undefined,
            visibilityFilter: undefined,
            sortBy: undefined,
            sortOrder: undefined,
          } as any,
        });
      }
    }
  }, [roles, navigate]);

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
        <RoleGuard requiredRoles={["MANAGER", "ADMIN"]}>
          <div className="container mx-auto pb-8 px-4">
            <h1 className="text-3xl font-bold text-center mb-8">
              ניהול הזמנות
            </h1>
            <FcmTokenRegistrar />
            <BookingManager
              selectedTab={tab}
              setSelectedTab={setTab}
              selectedBookingId={bookingId}
              setSelectedBookingId={setBookingId}
            />
          </div>
        </RoleGuard>
      </Authenticated>
      <Unauthenticated>
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-center mb-8">
            התחברות למערכת
          </h1>
          <SignInForm />
        </div>
      </Unauthenticated>
    </>
  );
}
