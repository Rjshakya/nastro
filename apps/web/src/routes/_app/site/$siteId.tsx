import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getSite } from "@/lib/site";
import type { Site } from "@/types/site";
import type { ExtendedRecordMap } from "notion-types";
import { SiteEditor } from "./-components/editor";

const siteSearchSchema = z.object({
  slug: z.string(),
});

export const Route = createFileRoute("/_app/site/$siteId")({
  validateSearch: siteSearchSchema,
  loaderDeps({ search: { slug } }) {
    return { slug };
  },
  loader: async ({ params, deps }) => {
    const { siteId } = params;
    const { slug } = deps;

    const { data } = await getSite({ rootPageId: siteId, slug });
    return {
      site: data?.site as Site,
      page: data?.page as ExtendedRecordMap,
      slug,
    };
  },
  component: SiteEditorPage,
});

function SiteEditorPage() {
  const { site, page, slug } = Route.useLoaderData();
  return <SiteEditor site={site} page={page} slug={slug} />;
}
