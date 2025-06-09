import { SignInForm } from "@/components/auth/sign-in-form";
import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";

import { BookingManager } from "@/components/office/booking-manager";

export const Route = createFileRoute("/office")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Authenticated>
        <BookingManager />
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
}
