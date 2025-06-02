import { SignInForm } from "@/components/auth/sign-in-form";
import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";

export const Route = createFileRoute("/office")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Authenticated>
        <div>{"autheticated content"}</div>
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
}
