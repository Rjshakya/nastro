import { TemplateIndexPage } from "#/components/templates/home";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/templates/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TemplateIndexPage />;
}
