import { SiteCard } from "./site-card";
import type { Site } from "@/types/site";
import { IconWorld, IconWorldOff } from "@tabler/icons-react";
import { CreateSiteDialog } from "./create-site";
import { EmptyState } from "@/components/empty";
import { useSites } from "@/hooks/use-sites";
import { DashboardLoading } from "../dashboard-loading";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ItemGroup } from "@/components/ui/item";

export const DashboardSitesSection = () => {
  const { data: sites, isLoading } = useSites();

  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className="bg-accent rounded-2xl p-1">
      <div className="mb-2 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconWorld className="size-5 text-blue-400" stroke={2} />
          <CardTitle>Sites</CardTitle>
        </div>
        <CreateSiteDialog />
      </div>

      <Card className="rounded-xl p-1 bg-background">
        <CardContent className="p-0">
          {sites && sites.length > 0 ? (
            <ItemGroup className="gap-0">
              {sites?.map((site) => (
                <SiteCard key={site.id} site={site as Site} />
              ))}
            </ItemGroup>
          ) : (
            <EmptyState
              className="py-8"
              icon={IconWorldOff}
              title="No Sites Yet"
              description="You haven't created any sites yet. Create your first site to get started."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
