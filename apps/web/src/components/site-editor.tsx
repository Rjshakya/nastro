"use client";

import { useState } from "react";
import { IconSettings } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { NotionRenderer } from "@/components/notion-renderer";
import { SiteSettings } from "@/components/site-settings";
import { useSite } from "@/hooks/use-sites";

interface SiteEditorProps {
  siteId: string;
  pageId: string;
}

export function SiteEditor({ siteId, pageId }: SiteEditorProps) {
  const { data: site, isLoading } = useSite(siteId);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background fixed top-0 inset-x-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* <h1 className="text-lg ">{site.siteName}</h1> */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <IconSettings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </header>

      <main
        contentEditable={false}
        className="w-full mx-auto px-4 py-24  z-0 "
      >
        <NotionRenderer pageId={pageId} recordMap={site} />
      </main>

      {/* <SiteSettings
        site={site}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      /> */}
    </div>
  );
}
