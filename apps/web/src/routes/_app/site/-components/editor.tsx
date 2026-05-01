import { NotionRenderer } from "@/components/notion/notion-renderer";
import "@/styles/notion.css";
import { SiteEditorHeader } from "./editor-header";
import { SettingsPanel } from "./editor-setting-panel";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useSiteSettingStore } from "@/stores/site.setting.store";
import { getRouteApi } from "@tanstack/react-router";
import { useThemeStore } from "@/stores/theme-store";
import { useCodePreviewStore } from "@/stores/code-preview.store";

const siteRoute = getRouteApi("/_app/site/$pageId");
const PREVIEW_STYLE_ID = "nastro-live-preview-css";

export function SiteEditor() {
  const { page, site, slug, themes } = siteRoute.useLoaderData();
  const { theme } = useTheme();
  const { setIsDark, setSettings } = useSiteSettingStore();
  const { setThemes } = useThemeStore();
  const previewCss = useCodePreviewStore((s) => s.previewCss);

  useEffect(() => {
    setThemes(themes);
    setSettings(site.setting);

    if (!themes || !themes?.length) {
      return;
    }

    const siteTheme = themes.find((theme) => theme.id === site?.themeId);
    useThemeStore.setState({ theme: siteTheme });
    setIsDark(theme === "dark");
  }, []);

  useEffect(() => {
    if (!previewCss) {
      const existing = document.getElementById(PREVIEW_STYLE_ID);
      if (existing) {
        existing.textContent = "";
      }
      return;
    }

    let styleTag = document.getElementById(PREVIEW_STYLE_ID) as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = PREVIEW_STYLE_ID;
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = previewCss;

    return () => {
      // Only clear textContent on cleanup; don't remove the tag
      // so it can be reused across rapid updates
      const existing = document.getElementById(PREVIEW_STYLE_ID) as HTMLStyleElement | null;
      if (existing) {
        existing.textContent = "";
      }
    };
  }, [previewCss]);

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
