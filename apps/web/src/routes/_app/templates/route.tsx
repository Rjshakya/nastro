import { createFileRoute } from "@tanstack/react-router";
import { TemplatesHome } from "./-components/templates-home";

export const Route = createFileRoute("/_app/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  return <TemplatesHome />;
}
