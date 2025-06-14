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
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
        dir="rtl"
      >
        דלג לתוכן הראשי
      </a>
      <BookingStoreSync />
      <DirectionProvider dir="rtl">
        <main id="main-content" className="p-4 sm:p-8 flex flex-col gap-16">
          <Outlet />
        </main>
      </DirectionProvider>
    </React.Fragment>
  );
}
