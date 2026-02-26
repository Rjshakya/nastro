import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth-client";
import { useNotionPages } from "@/hooks/use-notion";
import { NotionPages } from "@/components/notion-pages";
import { IconBrandNotion } from "@tabler/icons-react";

export default function DashboardComp() {
  const { data, error, isLoading, mutate } = useNotionPages();

  const handleConnect = async () => {
    await authClient.linkSocial({
      provider: "notion",
      callbackURL: import.meta.env.PUBLIC_CLIENT_URL + "/dashboard",
    });
  };

  const handleRetry = () => {
    mutate();
  };

  const isConnected = !error && (data !== undefined || isLoading);

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
                  <h1 className="text-2xl  tracking-tight">
                    Dashboard
                  </h1>
                </div>
              </div>

              <div className="bg-accent rounded-md">
                <div className="flex items-center justify-between  p-2 rounded-md">
                  <div className="flex items-center gap-3">
                    <Button size={"icon-lg"} variant={"outline"}>
                      <IconBrandNotion className="size-6 text-white" />
                    </Button>
                    <div>
                      <h3 className="font-medium">Notion</h3>
                      <p className="text-sm text-muted-foreground">
                        {isConnected
                          ? `${data?.length ?? 0} pages synced`
                          : "Connect your workspace"}
                      </p>
                    </div>
                  </div>
                  {!isConnected && (
                    <Button onClick={handleConnect}>Connect Notion</Button>
                  )}
                  {isConnected && (
                    <Button variant="outline" onClick={handleConnect}>
                      Reconnect
                    </Button>
                  )}
                </div>

                <NotionPages
                  data={data}
                  isLoading={isLoading}
                  error={error}
                  onRetry={handleRetry}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
