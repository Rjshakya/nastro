import { LiveSite } from "#/components/site/live";
import { getSite } from "#/hooks/use-sites";
import type { Site } from "#/types/site";
import { createFileRoute } from "@tanstack/react-router";
import type { ExtendedRecordMap } from "notion-types";
import z from "zod";
import { getNotionPageSeo } from "#/lib/utils";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import { loadFont } from "#/lib/fonts";

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
    const { data } = await getSite(siteId, pageId);
    const site = data?.site as Site;
    const page = data?.page as ExtendedRecordMap;
    const seo = getNotionPageSeo({ page, site, pageId });
    const settings = site?.siteSetting;
    useNotionSettingsStore.getState().updateSettings({ ...settings, seo });
    if (settings?.typography?.fonts) {
      Promise.all([
        loadFont(settings?.typography?.fonts?.primary as string),
        loadFont(settings?.typography?.fonts?.secondary as string),
      ]);
    }
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
  ssr: false,
});

function RouteComponent() {
  return <LiveSite />;
}
