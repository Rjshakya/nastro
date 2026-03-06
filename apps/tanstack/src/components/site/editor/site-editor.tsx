import { NotionRenderer } from "@/components/notion/notion-renderer";
import { useNotionCustomizationStore } from "@/stores/notion-customization-store";
import "@/styles/notion.css";
import { siteApi } from ".";
import { Settings } from "../settings/settings";

export function SiteEditor() {
  const { page, site } = siteApi.useLoaderData();
  const { pageId } = siteApi.useLoaderDeps();
  const { isPanelOpen, togglePanel } = useNotionCustomizationStore((s) => s);

  if (!site) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Site not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background relative rounded-md ">
      <div contentEditable={false} className="pb-24 z-0 ">
        <NotionRenderer siteId={site.id} pageId={pageId} recordMap={page} />
      </div>

      <Settings open={isPanelOpen} onOpenChange={togglePanel} />
    </main>
  );
}
