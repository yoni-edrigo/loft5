import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { BookingStoreSync } from "@/components/booking-store-sync";
import { DirectionProvider } from "@radix-ui/react-direction";
export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <BookingStoreSync />
      <DirectionProvider dir="rtl">
        <main className="p-4 sm:p-8 flex flex-col gap-16">
          <Outlet />
        </main>
      </DirectionProvider>
    </React.Fragment>
  );
}
