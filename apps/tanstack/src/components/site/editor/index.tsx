import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getRouteApi, Outlet } from "@tanstack/react-router";
import { SiteHeader } from "../site-header";

export const siteApi = getRouteApi("/site/$siteId");
export default function SiteEditorLayout() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 62)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader/>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
