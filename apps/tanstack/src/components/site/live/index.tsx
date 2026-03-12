import { NotionRenderer } from "#/components/notion/notion-renderer";
import { ClientOnly, getRouteApi } from "@tanstack/react-router";
import "@/styles/notion.css";
import type { NotionPageSettings } from "#/types/customization";
import { useEffect } from "react";
import { useNotionSettingsStore } from "#/stores/notion-settings";

const liveSiteRoute = getRouteApi("/$siteId");
export const LiveSite = () => {
  const { page, site } = liveSiteRoute.useLoaderData();
  useEffect(() => {
    if (site?.siteSetting) {
      useNotionSettingsStore.getState().updateSettings(site.siteSetting);
    }
  }, [site?.siteSetting]);
  return (
    <main>
      <ClientOnly fallback={null}>
        <NotionRenderer
          pageId={site.pageId ?? ""}
          siteId={site.id}
          recordMap={page}
          settings={site.siteSetting as NotionPageSettings}
        />
      </ClientOnly>
    </main>
  );
};
