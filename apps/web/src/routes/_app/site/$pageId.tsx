import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getSite } from "@/lib/site";
import type { Site } from "@/types/site";
import type { ExtendedRecordMap } from "notion-types";
import { SiteEditor } from "./-components/editor";
import { getAllThemes } from "@/lib/site.theme";

const siteSearchSchema = z.object({
  slug: z.string(),
});

export const Route = createFileRoute("/_app/site/$pageId")({
  validateSearch: siteSearchSchema,
  loaderDeps({ search: { slug } }) {
    return { slug };
  },
  loader: async ({ params, deps }) => {
    const { pageId } = params;
    const { slug } = deps;

    const { data } = await getSite({ rootPageId: pageId, slug });
    const { result } = await getAllThemes({ limit: 50 });

    return {
      site: data?.site as Site,
      page: data?.page as ExtendedRecordMap,
      slug,
      themes: result,
    };
  },
  component: SiteEditorPage,
});

function SiteEditorPage() {
  return <SiteEditor />;
}
