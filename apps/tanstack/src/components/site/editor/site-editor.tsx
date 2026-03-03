import { NotionRenderer } from "@/components/notion/notion-renderer";
import { SiteSettings } from "@/components/site/settings/site-settings";
import { useNotionCustomizationStore } from "@/stores/notion-customization-store";
import "@/styles/notion.css";
import { siteApi } from ".";
import { ClientOnly } from "@tanstack/react-router";

export function SiteEditor() {
  const { page, site } = siteApi.useLoaderData();
  const { pageId } = siteApi.useLoaderDeps();
  const { isPanelOpen, togglePanel } = useNotionCustomizationStore((s) => s);

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <p>Loading...</p>
  //     </div>
  //   );
  // }

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
            <h1 className="text-lg ">{site?.siteName}</h1>
          </div>
        </div>
      </header>

      <main contentEditable={false} className="pb-24 z-0 ">
        <NotionRenderer siteId={site.id} pageId={pageId} recordMap={page} />
      </main>

      {/* <ClientOnly> */}
      <SiteSettings site={site} open={isPanelOpen} onOpenChange={togglePanel} />
      {/* </ClientOnly> */}
    </div>
  );
}
