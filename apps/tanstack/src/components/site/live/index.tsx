import { NotionRenderer } from "#/components/notion/notion-renderer";
import { getRouteApi } from "@tanstack/react-router";
import "@/styles/notion.css";
import { useEffect } from "react";
import { loadFont } from "#/lib/fonts";
import { useNotionSettingsStore } from "#/stores/notion-settings";

const liveSiteRoute = getRouteApi("/$siteId");
export const LiveSite = () => {
  const { page, site, seo } = liveSiteRoute.useLoaderData();

  useEffect(() => {
    if (!page || !site) return;

    const run = () => {
      const settings = site?.siteSetting;
      useNotionSettingsStore.getState().updateSettings({ ...settings, seo });
      if (settings?.typography?.fonts) {
        Promise.all([
          loadFont(settings?.typography?.fonts?.primary as string),
          loadFont(settings?.typography?.fonts?.secondary as string),
        ]);
      }
    };

    run();
  }, [page, site]);

  return (
    <main>
      <NotionRenderer
        pageId={site.pageId as string}
        siteId={site.id}
        recordMap={page}
      />
    </main>
  );
};
