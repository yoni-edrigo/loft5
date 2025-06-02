import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);

  return (
    <Card className="w-96 mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Log in to see the numbers</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            formData.set("flow", flow);
            void signIn("password", formData).catch((error) => {
              setError(error.message);
            });
          }}
        >
          <Input type="email" name="email" placeholder="Email" required />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            required
          />
          <Button type="submit" className="w-full">
            {flow === "signIn" ? "Sign in" : "Sign up"}
          </Button>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {flow === "signIn"
                ? "Don't have an account?"
                : "Already have an account?"}
            </span>
            <Button
              variant="link"
              className="p-0 h-auto"
              type="button"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            >
              {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
