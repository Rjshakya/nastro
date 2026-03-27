import { SiteCard } from "./site-card";
import { Button } from "@/components/ui/button";
import type { Site } from "@/types/site";
import { IconWorld } from "@tabler/icons-react";
import { CreateSiteDialog } from "./create-site";
import { dashboardHomeApi } from "../home";

export const DashboardSitesSection = () => {
  const { sites } = dashboardHomeApi.useLoaderData();

  return (
    <div className="rounded-lg  bg-muted p-1.5 grid gap-2">
      <div className="flex items-center justify-between  pt-1">
        <div className="flex items-center">
          <Button size={"icon-sm"} variant={"ghost"}>
            <IconWorld className="size-5 text-blue-400" />
          </Button>
          <h3 className="font-medium">Sites</h3>
        </div>
        <CreateSiteDialog />
      </div>

      {sites && (
        <div className="grid gap-2  rounded-md p-1 bg-card">
          {sites?.map((site) => (
            <SiteCard
              className=" hover:bg-muted/40 transition-all duration-300 ease-in-out"
              key={site.id}
              site={site as Site}
            />
          ))}
        </div>
      )}
    </div>
  );
};
