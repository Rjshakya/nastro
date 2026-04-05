import { NotionRenderer } from "#/components/notion/notion-renderer";
import { getRouteApi } from "@tanstack/react-router";
import "@/styles/notion.css";
import type { NotionPageSettings } from "#/types/notion-page-settings";
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
  const { settings, updateSettings } = useNotionSettingsStore((s) => s);

  useLayoutEffect(() => {
    if (site?.siteSetting && page) {
      const localTheme = localStorage.getItem("nastro_theme") as "dark" | "light" | null;
      let originallyIsDark = site.siteSetting?.general?.isDark;

      /**
       *  here we are preferring user's browser state,
       *  if we have , otherwise fallback to original.
       */

      if (localTheme) {
        originallyIsDark = localTheme === "dark";
      }

      const defaultSettings = getDefaultSettings({
        existingSettings: {
          ...site?.siteSetting,
          general: {
            ...site?.siteSetting?.general,
            isDark: originallyIsDark,
            type: "general",
          },
        },
        page,
        site,
        pageId,
      });

      updateSettings({
        ...defaultSettings,
      });

      clientThemeToggle(!!originallyIsDark);
    }
  }, [site?.siteSetting, page]);
  return (
    <NotionRenderer
      pageId={pageId}
      slug={slug || ""}
      recordMap={page}
      settings={settings || ({} as NotionPageSettings)}
    />
  );
};
