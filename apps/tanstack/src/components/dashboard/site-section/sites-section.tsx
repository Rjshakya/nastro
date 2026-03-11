import { SiteCard } from "./site-card";
import { Button } from "@/components/ui/button";
import type { Site } from "@/types/site";
import { IconWorld } from "@tabler/icons-react";
import { CreateSiteDialog } from "./create-site";
import { useDeleteSite } from "#/components/hooks/use-sites";
import { dashboardHomeApi } from "../home";

export const DashboardSitesSection = () => {
  const { sites } = dashboardHomeApi.useLoaderData();
  const { deleteSite, isLoading: isDeleting } = useDeleteSite();

  return (
    <div className="rounded-lg border bg-card p-1.5 grid gap-4">
      <div className="flex items-center justify-between  pt-1">
        <div className="flex items-center gap-3">
          <Button size={"icon-sm"} variant={"secondary"}>
            <IconWorld className="size-5" />
          </Button>
          <h3 className="font-medium">Sites</h3>
        </div>
        <CreateSiteDialog />
      </div>

      {sites && (
        <div className="grid gap-2  rounded-md p-1">
          {sites?.map((site) => (
            <SiteCard
              key={site.id}
              site={site as Site}
              handleDelete={async (id) => {
                await deleteSite({ siteId: id, pageId: "" });
              }}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
};
