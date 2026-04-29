import { createFileRoute } from "@tanstack/react-router";
import { TemplateInstallPage } from "../-components/template-install";

export const Route = createFileRoute("/_app/templates/install/$templateId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { templateId } = Route.useParams();
  return <TemplateInstallPage templateId={templateId} />;
}
