import { getRouteApi } from "@tanstack/react-router";
import { NotionRenderer } from "@/components/notion/notion-renderer";
import type { SiteSetting } from "@/types/site.setting";
import { useEffect } from "react";
import { useSiteSettingStore } from "@/stores/site.setting.store";

const liveSiteRoute = getRouteApi("/_live_site/$pageId");

export function LiveSite() {
  const data = liveSiteRoute.useLoaderData();
  const { pageId } = liveSiteRoute.useParams();
  const { slug } = liveSiteRoute.useLoaderDeps();

  const site = data?.site;
  const settings = site?.setting as SiteSetting;
  const { setSettings } = useSiteSettingStore();

  useEffect(() => {
    setSettings(settings);
  }, []);

  if (!data.page || !data.site) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Site not found</p>
      </div>
    );
  }

  return (
    <main>
      <NotionRenderer
        pageId={pageId}
        recordMap={data.page}
        slug={slug || ""}
        settings={settings}
        styles={{}}
      />
    </main>
  );
}
