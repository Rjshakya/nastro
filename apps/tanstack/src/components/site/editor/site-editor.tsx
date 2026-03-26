import { NotionRenderer } from "@/components/notion/notion-renderer";
import "@/styles/notion.css";
import { siteEditorRoute } from ".";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import { SettingsV2 } from "../settings-v2/settings";
import { useLayoutEffect } from "react";
import { loadFont } from "#/lib/fonts";

export function SiteEditor() {
  const { page, site, settings: defaultSettings } = siteEditorRoute.useLoaderData();
  const { pageId } = siteEditorRoute.useParams();
  const { slug } = siteEditorRoute.useLoaderDeps({});
  const { isPanelOpen, togglePanel } = useNotionSettingsStore((s) => s);
  const { settings } = useNotionSettingsStore((s) => s);

  useLayoutEffect(() => {
    useNotionSettingsStore.getState().updateSettings({
      ...defaultSettings,
    });

    if (defaultSettings?.typography?.fonts) {
      Promise.all([
        loadFont(defaultSettings?.typography?.fonts?.primary as string),
        loadFont(defaultSettings?.typography?.fonts?.secondary as string),
      ]);
    }
  }, []);

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
        <NotionRenderer slug={slug} pageId={pageId} recordMap={page} settings={settings} />
      </div>

      {/* <Settings open={isPanelOpen} onOpenChange={togglePanel} /> */}
      <SettingsV2
        open={isPanelOpen}
        onOpenChange={togglePanel}
        pageSettings={{ ...settings }}
        siteId={site.id}
      />
    </main>
  );
}
