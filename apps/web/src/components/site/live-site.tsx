import { getRouteApi } from "@tanstack/react-router";
import { NotionRenderer } from "@/components/notion/notion-renderer";
import "@/styles/notion.css";

const liveSiteRoute = getRouteApi("/$pageId");

export function LiveSite() {
  const data = liveSiteRoute.useLoaderData();
  const { pageId } = liveSiteRoute.useParams();
  const { slug } = liveSiteRoute.useLoaderDeps();

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
