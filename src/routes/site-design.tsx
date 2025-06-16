import { SignInForm } from "@/components/auth/sign-in-form";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FcmTokenRegistrar } from "@/components/office/fcm-token-registrar";

import { OfficeImageUpload } from "@/components/office/office-image-upload";
import { ServicesControl } from "@/components/office/services-control";
import { OfficeNavbar } from "@/components/office/office-navbar";

export const Route = createFileRoute("/site-design")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as string) || "services",
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { tab } = useSearch({ from: "/site-design" });
  const navigate = useNavigate();
  return (
    <>
      <OfficeNavbar />

      <Authenticated>
        <div className="container mx-auto pb-8 px-4">
          <h1 className="text-3xl font-bold text-center mb-8">ניהול המשרד</h1>
          <FcmTokenRegistrar />
          <Tabs
            value={tab}
            onValueChange={(value) => {
              void navigate({
                search: { tab: value } as any,
                replace: true,
              });
            }}
            className="space-y-4"
            dir="rtl"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="services">שירותים</TabsTrigger>
              <TabsTrigger value="images">תמונות</TabsTrigger>
            </TabsList>

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
              <OfficeImageUpload />
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
