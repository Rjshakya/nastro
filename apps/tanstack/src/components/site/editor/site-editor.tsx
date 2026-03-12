import { NotionRenderer } from "@/components/notion/notion-renderer";
import "@/styles/notion.css";
import { siteApi } from ".";
import { Settings } from "../settings/settings";
import { useNotionSettingsStore } from "#/stores/notion-settings";

export function SiteEditor() {
  const { page, site } = siteApi.useLoaderData();
  const { pageId } = siteApi.useLoaderDeps();
  const { isPanelOpen, togglePanel } = useNotionSettingsStore((s) => s);
  const { settings } = useNotionSettingsStore((s) => s);

  if (!site) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Site not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background relative rounded-md ">
      <div contentEditable={false} className=" z-0 ">
        <NotionRenderer siteId={site.id} pageId={pageId} recordMap={page} settings={settings} />
      </div>

      <Settings open={isPanelOpen} onOpenChange={togglePanel} />
    </main>
  );
}
