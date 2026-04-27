import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/site/$siteId")({
  component: SiteDetailPage,
});

function SiteDetailPage() {
  const { siteId } = Route.useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Site: {siteId}</h1>
      <p className="text-muted-foreground">Site editor will appear here.</p>
    </div>
  );
}
