"use client";

import { NotionRenderer } from "@/components/notion/notion-renderer";
import { SiteSettings } from "@/components/site/settings/site-settings";
import { useSite } from "@/hooks/use-sites";
import type { Site } from "@/types/site";
import { useNotionCustomizationStore } from "@/stores/notion-customization-store";
import "@/styles/notion.css";

interface SiteEditorProps {
  siteId: string;
  pageId: string;
}

export function SiteEditor({ siteId, pageId }: SiteEditorProps) {
  const { data: site, isLoading } = useSite(siteId, pageId);
  const { isPanelOpen, togglePanel } = useNotionCustomizationStore((s) => s);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Site not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative rounded-md ">
      <header className="site-header border-b bg-background  z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg ">{site?.site?.siteName}</h1>
          </div>
        </div>
      </header>

      <main contentEditable={false} className="pb-24 z-0 ">
        <NotionRenderer
          siteId={siteId}
          pageId={pageId}
          recordMap={site?.page}
        />
      </main>

      <SiteSettings
        site={site?.site as Site}
        open={isPanelOpen}
        onOpenChange={togglePanel}
      />
    </div>
  );
}
