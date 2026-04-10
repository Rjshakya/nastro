import { createFileRoute } from "@tanstack/react-router";
import { TemplateInstallPage } from "@/components/templates/install";

export const Route = createFileRoute("/templates/install/$templateId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TemplateInstallPage />;
}
