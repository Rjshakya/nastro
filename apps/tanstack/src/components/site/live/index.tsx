import { NotionRenderer } from "#/components/notion/notion-renderer";
import { getRouteApi } from "@tanstack/react-router";
import "@/styles/notion.css";
import type { NotionPageSettings } from "#/types/customization";

const liveSiteRoute = getRouteApi("/$siteId");
export const LiveSite = () => {
  const { page, site } = liveSiteRoute.useLoaderData();
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
