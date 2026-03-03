import DashboardLayout from "#/components/dashboard/layout";
import { getNotionPages } from "#/hooks/use-notion";
import { getSites } from "#/hooks/use-sites";
import type { NotionPages } from "#/types/notion";
import type { Site } from "#/types/site";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  loader: async () => {
    const sites = await getSites();
    const pages = await getNotionPages();
    return { sites: sites.data as Site[], pages: pages.data as NotionPages };
  },
  errorComponent: ({ error }) => (
    <div>
      <p className="text-destructive">{error.message}</p>
    </div>
  ),
  pendingComponent: () => <div>loading...</div>,
  ssr: false,
});

function RouteComponent() {
  return <DashboardLayout />;
}
