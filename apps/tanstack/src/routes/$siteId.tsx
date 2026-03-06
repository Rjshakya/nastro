import { LiveSite } from "#/components/site/live";
import { getSite } from "#/lib/site";
import type { Site } from "#/types/site";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import type { ExtendedRecordMap } from "notion-types";
import z from "zod";
import { getNotionPageSeo } from "#/lib/utils";

const siteSearchSchema = z.object({
  pageId: z.string(),
});

export const Route = createFileRoute("/$siteId")({
  validateSearch: siteSearchSchema,
  loaderDeps({ search: { pageId } }) {
    return { pageId };
  },
  loader: async ({ params, deps }) => {
    const { siteId } = params;
    const { pageId } = deps;
    const { data } = await getSite({ pageId, siteId });
    const site = data?.site as Site;
    const page = data?.page as ExtendedRecordMap;
    const seo = getNotionPageSeo({ page, site, pageId });
    return { site, page, seo };
  },
  component: RouteComponent,
  head: ({ loaderData }) => {
    return {
      meta: [
        { title: loaderData?.site.siteName },
        { property: "og:title", content: loaderData?.seo?.title },
        { property: "og:description", content: loaderData?.seo?.description },
        {
          property: "og:url",
          content: loaderData?.seo?.pageUrl,
        },
        {
          property: "og:image",
          content: loaderData?.seo?.ogImage,
        },
        { name: "twitter:title", content: loaderData?.seo?.title },
        { name: "twitter:description", content: loaderData?.seo?.description },
        {
          name: "twitter:url",
          content: loaderData?.seo?.pageUrl,
        },
        {
          name: "twitter:image",
          content: loaderData?.seo?.ogImage,
        },
      ],
    };
  },
});

function RouteComponent() {
  return (
    <ClientOnly fallback={null}>
      <LiveSite />
    </ClientOnly>
  );
}
