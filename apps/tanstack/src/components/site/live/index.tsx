import { NotionRenderer } from "#/components/notion/notion-renderer";
import { getRouteApi } from "@tanstack/react-router";
import "@/styles/notion.css";
import type { NotionPageSettings } from "#/types/customization";
import { useLayoutEffect } from "react";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import { getDefaultSettings } from "#/lib/settings-defaults";
import { clientThemeToggle } from "#/lib/utils";

const liveSiteRoute = getRouteApi("/$pageId");
export const LiveSite = () => {
  const data = liveSiteRoute.useLoaderData();
  const site = data?.site;
  const page = data?.page;
  const { slug } = liveSiteRoute.useLoaderDeps();
  const { pageId } = liveSiteRoute.useParams({});
  useLayoutEffect(() => {
    if (site?.siteSetting && page) {
      const defaultSettings = getDefaultSettings({
        existingSettings: site?.siteSetting,
        page,
        site,
        pageId,
      });

      clientThemeToggle(!!site?.siteSetting?.general?.isDark);
      useNotionSettingsStore.getState().updateSettings({
        ...defaultSettings,
      });
    }
  }, [site?.siteSetting, page]);
  return (
    <NotionRenderer
      pageId={pageId}
      slug={slug}
      recordMap={page}
      settings={site?.siteSetting || ({} as NotionPageSettings)}
    />
  );
};
