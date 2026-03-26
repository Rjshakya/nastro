import DashboardLayout from "#/components/dashboard/layout";
import { protectedLoader } from "#/lib/auth-client";
import { getNotionPages } from "#/lib/notion";
import { getSites } from "#/lib/site";
import type { NotionPages } from "#/types/notion";
import type { Site } from "#/types/site";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  loader: async () => {
    const sites = await getSites();
    // const pages = await getNotionPages();
    return { sites: sites.data as Site[] };
  },
  errorComponent: ({ error }) => (
    <div>
      <p className="text-destructive">{error.message}</p>
    </div>
  ),
  // pendingComponent: () => <div>loading...</div>,
  ssr: false,
  beforeLoad: protectedLoader,
});

function RouteComponent() {
  return <DashboardLayout />;
}
