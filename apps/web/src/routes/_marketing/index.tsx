import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Nastro</h1>
      <p className="text-muted-foreground">
        Fastest way from notion doc to published site.
      </p>
    </div>
  );
}
