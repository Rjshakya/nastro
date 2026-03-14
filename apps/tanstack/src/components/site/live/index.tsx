import { NotionRenderer } from "#/components/notion/notion-renderer";
import { ClientOnly, getRouteApi } from "@tanstack/react-router";
import "@/styles/notion.css";
import type { NotionPageSettings } from "#/types/customization";
import { useEffect } from "react";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import { applyDefaultSettings } from "#/lib/settings-defaults";
import { clientThemeToggle } from "#/lib/utils";

const liveSiteRoute = getRouteApi("/$siteId");
export const LiveSite = () => {
  const { page, site } = liveSiteRoute.useLoaderData();
  const { pageId } = liveSiteRoute.useLoaderDeps();
  useEffect(() => {
    if (site?.siteSetting) {
      const defaultSettings = applyDefaultSettings({
        existingSettings: site?.siteSetting,
        page,
        pageId,
        site,
      });

      clientThemeToggle(!!site?.siteSetting?.general?.isDark);
      useNotionSettingsStore.getState().updateSettings({
        ...defaultSettings,
      });
    }
  }, [site?.siteSetting]);
  return (
    <main>
      <NotionRenderer
        pageId={site.pageId ?? ""}
        siteId={site.id}
        recordMap={page}
        settings={site.siteSetting as NotionPageSettings}
      />
    </main>
  );
};
