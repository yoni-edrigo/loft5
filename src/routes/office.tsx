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
import { FcmTokenRegistrar } from "@/components/office/fcm-token-registrar";
import { ServicesControl } from "@/components/office/services-control";
import { OfficeImageUpload } from "@/components/office/office-image-upload";

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
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-center mb-8">ניהול המשרד</h1>
          <FcmTokenRegistrar />
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bookings">הזמנות</TabsTrigger>
              <TabsTrigger value="pricing">מחירים</TabsTrigger>
              <TabsTrigger value="services">שירותים</TabsTrigger>
              <TabsTrigger value="images">תמונות</TabsTrigger>
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
            <TabsContent
              value="services"
              className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300"
            >
              <ServicesControl />
            </TabsContent>
            <TabsContent
              value="images"
              className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300"
            >
              {/* טאב להעלאת תמונות */}
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">העלאת תמונה חדשה</h2>
                <OfficeImageUpload />
              </div>
            </TabsContent>
          </Tabs>
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
