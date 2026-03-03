import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteEditor } from "./site-editor";

interface SiteEditorProps {
  siteId: string;
  pageId: string;
}

export default function SiteEditorDashboard({
  siteId,
  pageId,
}: SiteEditorProps) {

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
        <SiteHeader />
        <SiteEditor pageId={pageId} siteId={siteId} />
      </SidebarInset>
    </SidebarProvider>
  );
}
