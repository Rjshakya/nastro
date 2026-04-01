import DashboardLayout from "#/components/dashboard/layout";
import { Error } from "#/components/error";
import { DashboardLoading } from "#/components/dashboard/dashboard-loading";
import { protectedLoader } from "#/lib/auth-client";
import { getSites } from "#/lib/site";
import type { Site } from "#/types/site";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  loader: async () => {
    const sites = await getSites();
    return { sites: sites.data as Site[] };
  },
  errorComponent: ({ error }) => (
    <Error message={error?.message} onRetry={() => window.location.reload()} />
  ),
  pendingComponent: DashboardLoading,
  ssr: false,
  beforeLoad: protectedLoader,
});

function RouteComponent() {
  return <DashboardLayout />;
}
