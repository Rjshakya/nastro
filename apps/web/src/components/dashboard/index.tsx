import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth-client";
import { useNotionPages } from "@/hooks/use-notion";
import { NotionPages } from "@/components/notion-pages";
import { useSites, useDeleteSite } from "@/hooks/use-sites";
import { SiteCard, SiteCardSkeleton } from "@/components/site-card";
import { CreateSiteDialog } from "@/components/create-site-dialog";
import { IconBrandNotion, IconWorld } from "@tabler/icons-react";

export default function DashboardComp() {
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

  const handleConnect = async () => {
    await authClient.linkSocial({
      provider: "notion",
      callbackURL: import.meta.env.PUBLIC_CLIENT_URL + "/dashboard",
    });
  };

  const handleRetry = () => {
    mutateNotion();
  };

  const isNotionConnected =
    !notionError && (notionPages !== undefined || isLoadingNotion);

  const handleEditSite = (site: { id: string; pageId: string | null }) => {
    const baseUrl = import.meta.env.PUBLIC_CLIENT_URL;
    window.location.href = `${baseUrl}/site/${site.id}?pageId=${site.pageId ?? ""}`;
  };

  const handleDeleteSite = async (siteId: string) => {
    await deleteSite(siteId);
    mutateSites();
  };

  const handleSiteCreated = () => {
    mutateSites();
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
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
              <div className="rounded-lg border bg-card p-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Button variant={"ghost"} size={"icon"}>
                      <IconBrandNotion className="size-5 text-white" />
                    </Button>
                    <div>
                      <h3 className="font-medium">Notion Pages</h3>
                      {/* <p className="text-sm text-muted-foreground">
                        {isNotionConnected
                          ? `${notionPages?.length ?? 0} pages synced`
                          : "Connect your workspace"}
                      </p> */}
                    </div>
                  </div>
                  {!isNotionConnected ? (
                    <Button onClick={handleConnect}>Connect Notion</Button>
                  ) : (
                    <Button size={"sm"} variant="outline" onClick={handleConnect}>
                      Reconnect
                    </Button>
                  )}
                </div>

                <NotionPages
                  data={notionPages}
                  isLoading={isLoadingNotion}
                  error={notionError}
                  onRetry={handleRetry}
                />
              </div>

              {/* Sites Section */}
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
                    <p className="text-sm">
                      Create your first site from a Notion page
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sites?.map((site) => (
                      <SiteCard
                        key={site.id}
                        site={site}
                        onEdit={handleEditSite}
                        onDelete={handleDeleteSite}
                        isDeleting={isDeleting}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
