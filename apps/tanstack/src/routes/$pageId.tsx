import { LiveSite } from "#/components/site/live";
import type { Site } from "#/types/site";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import type { ExtendedRecordMap } from "notion-types";
import z from "zod";
import { getNotionPageSeo } from "#/lib/utils";
import { getFontLink } from "#/lib/fonts";
import type { NotionPageSettings } from "#/types/customization";
import { getSite } from "#/lib/site";

const siteSearchSchema = z.object({
  slug: z.string(),
});

export const Route = createFileRoute("/$pageId")({
  validateSearch: siteSearchSchema,
  loaderDeps({ search: { slug } }) {
    return { slug };
  },
  loader: async ({ params, deps }) => {
    const { pageId } = params;
    const { slug } = deps;
    const { data } = await getSite({ pageId, slug });
    const site = data?.site as Site;
    const page = data?.page as ExtendedRecordMap;
    const seo = getNotionPageSeo({ page, site, pageId });
    const settings = { ...site?.siteSetting } as NotionPageSettings;
    // const styles = covertPageSettingsIntoStyles(settings);
    const fonts = {
      primary: getFontLink(settings?.typography?.fonts?.primary),
      secondary: getFontLink(settings?.typography?.fonts?.secondary),
    };

    return {
      site,
      page,
      seo,
      css: {
        // styles,
        fonts,
      },
    };

    // return await liveSiteLoader({ data: { siteId, pageId } });
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
      links: [
        {
          rel: loaderData?.css.fonts.primary?.rel,
          href: loaderData?.css.fonts.primary?.href,
        },
        {
          rel: loaderData?.css.fonts.secondary?.rel,
          href: loaderData?.css.fonts.secondary?.href,
        },
      ],
    };
  },

  /**
   *   @description To - do
   *
   *   i have to do it , ssr:true
   *   for that , i have to call getSite in createServerfnhandler ,
   *   then only it may work
   *   because it is public route , not need for sending cookies for auth.
   */

  ssr: false,
});

function RouteComponent() {
  return (
    <main>
      <ClientOnly fallback={null}>
        <LiveSite />
      </ClientOnly>
    </main>
  );
}
