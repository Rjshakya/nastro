import SiteEditorLayout from "#/components/site/editor";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/site")({
  component: RouteComponent,
  ssr: false,
  pendingComponent: () => <div>Loading...</div>,
});

function RouteComponent() {
  return <SiteEditorLayout />;
}
