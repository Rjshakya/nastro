import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { buildLiveSiteHead, liveSiteLoader } from "@/lib/live-site";
import { LiveSiteContent } from "./-components/live-site";
import { Error } from "@/components/error";

const siteSearchSchema = z.object({
  slug: z.string().optional(),
});

export const Route = createFileRoute("/_live_site/$pageId")({
  validateSearch: siteSearchSchema,
  loaderDeps({ search: { slug } }) {
    return { slug };
  },
  loader: async ({ params, deps }) => {
    const { pageId } = params;
    const { slug } = deps;

    return await liveSiteLoader({ data: { pageId, slug } });
  },
  component: LiveSitePage,
  head: ({ loaderData }) => {
    const header = buildLiveSiteHead(loaderData);

    return {
      meta: header?.meta,
      links: header?.links,
      scripts: header?.scripts,
      styles: header?.styles,
    };
  },
  ssr: true,
  errorComponent: Error,
});

function LiveSitePage() {
  const data = Route.useLoaderData();
  const { pageId } = Route.useParams();
  const { slug } = Route.useSearch();

  return <LiveSiteContent data={data} pageId={pageId} slug={slug || ""} />;
}
