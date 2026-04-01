import { Error } from "#/components/error";
import SiteEditorLayout from "#/components/site/editor";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/site")({
  component: RouteComponent,
  ssr: false,
  errorComponent: ({ error }) => (
    <Error message={error.message} onRetry={() => window.location.reload()} />
  ),
});

function RouteComponent() {
  return <SiteEditorLayout />;
}
