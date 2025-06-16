import { SignInForm } from "@/components/auth/sign-in-form";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FcmTokenRegistrar } from "@/components/office/fcm-token-registrar";

import { PricingControl } from "@/components/office/pricing-control";
import { OfficeNavbar } from "@/components/office/office-navbar";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useEffect } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { UserManagement } from "@/components/office/user-management";

export const Route = createFileRoute("/site-control")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as string) || "pricing",
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { tab } = useSearch({ from: "/site-control" });
  const navigate = useNavigate();
  const roles = useUserRoles();

  // Redirect if user has a more appropriate role
  useEffect(() => {
    if (roles && !roles.includes("ADMIN")) {
      if (roles.includes("MANAGER")) {
        void navigate({
          to: "/office",
          search: { tab: "pending", bookingId: undefined },
        });
      } else if (roles.includes("DESIGNER")) {
        void navigate({ to: "/site-design", search: { tab: "services" } });
      }
    }
  }, [roles, navigate]);

  return (
    <>
      <OfficeNavbar />
      <Authenticated>
        <RoleGuard requiredRoles={["ADMIN"]}>
          <div className="container mx-auto pb-8 px-4">
            <h1 className="text-3xl font-bold text-center mb-8">ניהול המשרד</h1>
            <FcmTokenRegistrar />
            <Tabs
              value={tab}
              onValueChange={(value) => {
                void navigate({ search: { tab: value } as any, replace: true });
              }}
              className="space-y-4"
              dir="rtl"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pricing">מחירים</TabsTrigger>
                <TabsTrigger value="users">משתמשים</TabsTrigger>
              </TabsList>
              <TabsContent
                value="pricing"
                className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300"
              >
                <PricingControl />
              </TabsContent>
              <TabsContent
                value="users"
                className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300"
              >
                <UserManagement />
              </TabsContent>
            </Tabs>
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
