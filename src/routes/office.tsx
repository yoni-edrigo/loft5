import { SignInForm } from "@/components/auth/sign-in-form";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { BookingManager } from "@/components/office/booking-manager";
import { PricingControl } from "@/components/office/pricing-control";

export const Route = createFileRoute("/office")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as string) || "bookings",
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { tab } = useSearch({ from: "/office" });
  const navigate = useNavigate();

  return (
    <>
      <Authenticated>
        <Tabs
          value={tab}
          onValueChange={(value) => {
            void navigate({
              to: "/office",
              search: { tab: value },
            });
          }}
          className="space-y-4"
          dir="rtl"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bookings">הזמנות</TabsTrigger>
            <TabsTrigger value="pricing">מחירים</TabsTrigger>
          </TabsList>
          <TabsContent
            value="bookings"
            className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300"
          >
            <BookingManager />
          </TabsContent>
          <TabsContent
            value="pricing"
            className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300"
          >
            <PricingControl />
          </TabsContent>
        </Tabs>
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
}
