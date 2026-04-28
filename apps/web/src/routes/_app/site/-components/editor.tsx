import { NotionRenderer } from "@/components/notion/notion-renderer";
import "@/styles/notion.css";
import { SiteEditorHeader } from "./editor-header";
import type { Site } from "@/types/site";
import type { ExtendedRecordMap } from "notion-types";
import { SettingsPanel } from "./editor-setting-panel";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useSiteSettingStore } from "@/stores/site.setting.store";

interface SiteEditorProps {
  site: Site;
  page: ExtendedRecordMap;
  slug: string;
}

export function SiteEditor({ site, page, slug }: SiteEditorProps) {
  const { theme } = useTheme();
  const { setIsDark } = useSiteSettingStore();
  useEffect(() => {
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
