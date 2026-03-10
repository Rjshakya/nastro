import { NotionRenderer } from "#/components/notion/notion-renderer";
import { getRouteApi } from "@tanstack/react-router";
import "@/styles/notion.css";

const liveSiteRoute = getRouteApi("/$siteId");
export const LiveSite = () => {
  const { page, site, seo } = liveSiteRoute.useLoaderData();
  return (
    <main>
      <NotionRenderer
        pageId={site.pageId as string}
        siteId={site.id}
        recordMap={page}
        header={site.siteSetting?.layout?.header}
        footer={site.siteSetting?.layout?.footer}
      />
    </main>
  );
};
