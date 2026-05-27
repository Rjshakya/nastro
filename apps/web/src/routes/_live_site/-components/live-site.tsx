import { getRouteApi } from "@tanstack/react-router";
import { NotionRenderer } from "@/components/notion/notion-renderer";
import { getDefaultSettings } from "@/lib/default-settings";
import type { SiteSetting } from "@/types/site.setting";
import { computeStyles } from "@/lib/compute-styles";

const liveSiteRoute = getRouteApi("/_live_site/$pageId");

export function LiveSite() {
  const data = liveSiteRoute.useLoaderData();
  const { pageId } = liveSiteRoute.useParams();
  const { slug } = liveSiteRoute.useLoaderDeps();

  const site = data?.site;
  const setting = site?.setting as SiteSetting;
  const isDark = !!setting?.general?.isDark;
  const withDefaults = getDefaultSettings(setting);
  const styles = computeStyles(withDefaults, isDark ? "dark" : "light");

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
        settings={setting}
        styles={styles}
      />
    </main>
  );
}
