import LandingPageV2 from "@/landing-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LandingPageV2 />;
}
