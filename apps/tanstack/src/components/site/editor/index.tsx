import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getRouteApi, Outlet } from "@tanstack/react-router";
import { SiteEditorHeader } from "./site-editor-header";

export const siteEditorRoute = getRouteApi("/site/$pageId");
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
        <SiteEditorHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
