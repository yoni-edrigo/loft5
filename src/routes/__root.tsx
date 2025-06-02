import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { BookingStoreSync } from "@/components/booking-store-sync";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <BookingStoreSync />
      <main className="p-8 flex flex-col gap-16">
        <Outlet />
      </main>
    </React.Fragment>
  );
}
