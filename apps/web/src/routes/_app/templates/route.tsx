import { Error } from "@/components/error";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/templates")({
  component: TemplatesLayout,
  errorComponent:Error
});

function TemplatesLayout() {
  return <Outlet />;
}
