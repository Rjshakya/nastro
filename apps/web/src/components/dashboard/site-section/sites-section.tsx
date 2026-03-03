import { SiteCard, SiteCardSkeleton } from "./site-card";
import { Button } from "@/components/ui/button";
import type { Site } from "@/types/site";
import { IconWorld } from "@tabler/icons-react";
import { CreateSiteDialog } from "./create-site";

export const DashboardSitesSection = ({
  sites,
  isLoadingSites,
  sitesError,
  handleDeleteSite,
  handleEditSite,
  handleSiteCreated,
  isDeleting,
}: {
  sites: Site[];
  isLoadingSites: boolean;
  sitesError: any;
  isDeleting: boolean;
  handleEditSite: (site: { id: string; pageId: string | null }) => void;
  handleDeleteSite: (siteId: string) => Promise<void>;
  handleSiteCreated: (site: Site) => void;
}) => {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button size={"icon"} variant={"secondary"}>
            <IconWorld className="size-5" />
          </Button>
          <div>
            <h3 className="font-medium">Sites</h3>
            <p className="text-sm text-muted-foreground">
              {sites?.length ?? 0} sites created
            </p>
          </div>
        </div>
        <CreateSiteDialog onSuccess={handleSiteCreated} />
      </div>

      {isLoadingSites ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SiteCardSkeleton key={i} />
          ))}
        </div>
      ) : sitesError ? (
        <div className="text-center py-8 text-muted-foreground">
          Failed to load sites
        </div>
      ) : sites?.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="mb-2">No sites yet</p>
          <p className="text-sm">Create your first site from a Notion page</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites?.map((site) => (
            <SiteCard
              key={site.id}
              site={site as Site}
              onEdit={handleEditSite}
              onDelete={handleDeleteSite}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
};
