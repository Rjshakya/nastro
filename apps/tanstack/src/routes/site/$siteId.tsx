import { getSite } from "#/hooks/use-sites";
import type { Site } from "#/types/site";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import type { ExtendedRecordMap } from "notion-types";
import { SiteEditor } from "#/components/site/editor/site-editor";

const siteSearchSchema = z.object({
  pageId: z.string(),
});

export const Route = createFileRoute("/site/$siteId")({
  validateSearch: siteSearchSchema,
  loaderDeps({ search: { pageId } }) {
    return { pageId };
  },
  component: RouteComponent,
  loader: async ({ params, deps }) => {
    const { siteId } = params;
    const { pageId } = deps;
    const { data } = await getSite(siteId, pageId);
    return { site: data.site as Site, page: data.page as ExtendedRecordMap };
  },
});

function RouteComponent() {
  return <SiteEditor />;
}
