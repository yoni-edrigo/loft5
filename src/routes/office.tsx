import { SignInForm } from "@/components/auth/sign-in-form";
import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookingManager } from "@/components/office/booking-manager";

export const Route = createFileRoute("/office")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Authenticated>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">ניהול הלופט</CardTitle>
              <CardDescription>
                כאן תוכל לנהל את ההזמנות, המחירים והתאריכים הזמינים
              </CardDescription>
            </CardHeader>
          </Card>

          <BookingManager />
        </div>
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
}
