import { Error } from "@/components/error";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing")({
  component: MarketingLayout,
  errorComponent: Error,
});

function MarketingLayout() {
  return <Outlet />;
}
