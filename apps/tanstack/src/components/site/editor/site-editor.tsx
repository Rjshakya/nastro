import { NotionRenderer } from "@/components/notion/notion-renderer";
import { useNotionCustomizationStore } from "@/stores/notion-customization-store";
import "@/styles/notion.css";
import { siteApi } from ".";
import { Settings } from "../settings/settings";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import { useEffect } from "react";
import { getNotionPageIcon, getNotionPageTitle } from "#/lib/utils";

export function SiteEditor() {
  const { page, site } = siteApi.useLoaderData();
  const { pageId } = siteApi.useLoaderDeps();
  const { isPanelOpen, togglePanel } = useNotionCustomizationStore((s) => s);
  const { settings } = useNotionSettingsStore((s) => s);

  // useEffect(() => {
  //   const run = () => {
  //     const defaultPageIcon = getNotionPageIcon(page, pageId);
  //     const defaultPageTitle = getNotionPageTitle(page);

  //     useNotionSettingsStore.setState({
  //       settings: {
  //         general: {
  //           ...settings?.general,
  //           pageWidth: settings?.general?.pageWidth || 65,
  //         },
  //         layout: {
  //           ...settings?.layout,
  //           header: settings?.layout?.header || {
  //             text: defaultPageTitle || "",
  //             logo: defaultPageIcon || "",
  //             width: 100,
  //           },
  //           footer: settings?.layout?.footer || {
  //             text: defaultPageTitle || "",
  //             logo: defaultPageIcon || "",
  //             width: 100,
  //           },
  //         },
  //         theme: settings?.theme || { ...site?.siteSetting?.theme },
  //       },
  //     });
  //   };

  //   run();
  // }, []);

  if (!site) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Site not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background relative rounded-md ">
      <div contentEditable={false} className=" z-0 ">
        <NotionRenderer
          siteId={site.id}
          pageId={pageId}
          recordMap={page}
          settings={settings}
        />
      </div>

      <Settings open={isPanelOpen} onOpenChange={togglePanel} />
    </main>
  );
}
