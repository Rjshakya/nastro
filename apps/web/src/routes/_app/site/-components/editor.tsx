import { NotionRenderer } from "@/components/notion/notion-renderer";
import "@/styles/notion.css";
import { SiteEditorHeader } from "./editor-header";
import { SettingsPanel } from "./editor-setting-panel";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useSiteSettingStore } from "@/stores/site.setting.store";
import { getRouteApi } from "@tanstack/react-router";
import { useThemeStore } from "@/stores/theme-store";

const siteRoute = getRouteApi("/_app/site/$pageId");

export function SiteEditor() {
  const { page, site, slug, themes } = siteRoute.useLoaderData();
  const { theme } = useTheme();
  const { setIsDark, setSettings } = useSiteSettingStore();
  const { setThemes } = useThemeStore();
  useEffect(() => {
    setThemes(themes);
    console.log(theme);
    setSettings(site.setting);

    if (!themes || !themes?.length) {
      return;
    }

    const siteTheme = themes.find((theme) => theme.id === site?.themeId);
    useThemeStore.setState({ theme: siteTheme });
    setIsDark(theme === "dark");
  }, []);

  if (!site) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Site not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background relative rounded-md">
      <SiteEditorHeader />
      <div contentEditable={false} className="z-0">
        <NotionRenderer pageId={site.rootPageId} recordMap={page} slug={slug} />
      </div>
      <SettingsPanel site={site} />
    </main>
  );
}
