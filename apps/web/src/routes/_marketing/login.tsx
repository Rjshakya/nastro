import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/auth-client";

export const Route = createFileRoute("/_marketing/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>
      <Button onClick={login} size="lg">
        Sign in with Google
      </Button>
    </div>
  );
}
