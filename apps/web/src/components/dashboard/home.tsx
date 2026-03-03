import { DashboardSitesSection } from "./site-section/sites-section";
import { useNotionPages } from "@/hooks/use-notion";
import { useDeleteSite, useSites } from "@/hooks/use-sites";
import { DashboardNotionSection } from "./notion-section/notion-section";
import type { Site } from "@/types/site";

export const DashboardHome = () => {
  const {
    data: notionPages,
    error: notionError,
    isLoading: isLoadingNotion,
    mutate: mutateNotion,
  } = useNotionPages();
  const {
    data: sites,
    error: sitesError,
    isLoading: isLoadingSites,
    mutate: mutateSites,
  } = useSites();
  const { deleteSite, isLoading: isDeleting } = useDeleteSite();

  const handleEditSite = (site: { id: string; pageId: string | null }) => {
    const baseUrl = import.meta.env.PUBLIC_CLIENT_URL;
    window.location.href = `${baseUrl}/site/${site.id}?pageId=${site.pageId ?? ""}`;
  };

  const handleDeleteSite = async (siteId: string) => {
    await deleteSite(siteId);
    mutateSites();
  };

  const handleSiteCreated = (site: Site) => {
    const baseUrl = import.meta.env.PUBLIC_CLIENT_URL;
    window.location.href = `${baseUrl}/site/${site.id}?pageId=${site.pageId ?? ""}`;
    mutateSites();
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your connected integrations
              </p>
            </div>
          </div>

          {/* Notion Section */}
          <DashboardNotionSection
            isLoadingNotion={isLoadingNotion}
            mutate={mutateNotion}
            notionPages={notionPages}
            notionError={notionError}
          />

          {/* Sites Section */}
          <DashboardSitesSection
            sites={sites}
            isLoadingSites={isLoadingSites}
            sitesError={sitesError}
            isDeleting={isDeleting}
            handleSiteCreated={handleSiteCreated}
            handleEditSite={handleEditSite}
            handleDeleteSite={handleDeleteSite}
          />
        </div>
      </div>
    </div>
  );
};
