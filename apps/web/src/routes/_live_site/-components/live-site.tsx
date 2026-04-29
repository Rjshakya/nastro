import { getRouteApi } from "@tanstack/react-router";
import { NotionRenderer } from "@/components/notion/notion-renderer";
import "@/styles/notion.css";
import { useEffect } from "react";
import { useSiteSettingStore } from "@/stores/site.setting.store";

const liveSiteRoute = getRouteApi("/_live_site/$pageId");

export function LiveSite() {
  const data = liveSiteRoute.useLoaderData();
  const { pageId } = liveSiteRoute.useParams();
  const { slug } = liveSiteRoute.useLoaderDeps();
  const { setSettings } = useSiteSettingStore();

  useEffect(() => {
    if (!data?.site) {
      return;
    }

    console.log(JSON.stringify(data.site, null, 2));
    setSettings(data.site.setting);
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
      <NotionRenderer pageId={pageId} recordMap={data.page} slug={slug || ""} />
    </main>
  );
}
