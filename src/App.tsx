"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import LandingPageV2 from "./landing-page";

export default function App() {
  return (
    <main className="p-8 flex flex-col gap-16">
      <Authenticated>
        <div>{"autheticated content"}</div>
      </Authenticated>
      <Unauthenticated>
        <LandingPageV2 />
      </Unauthenticated>
    </main>
  );
}
