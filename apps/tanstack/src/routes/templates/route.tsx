import TemplateLayout from "#/components/templates/layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/templates")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TemplateLayout />;
}
