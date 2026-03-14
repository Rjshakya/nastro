import { LiveSite } from "#/components/site/live";
import type { Site } from "#/types/site";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import type { ExtendedRecordMap } from "notion-types";
import z from "zod";
import { covertPageSettingsIntoStyles, getNotionPageSeo } from "#/lib/utils";
import { getFontLink } from "#/lib/fonts";
import type { NotionPageSettings } from "#/types/customization";
import { createServerFn } from "@tanstack/react-start";
import { getSite } from "#/lib/site";

const siteSearchSchema = z.object({
  pageId: z.string(),
});

const executor = createServerFn()
  .inputValidator(z.object({ pageId: z.string(), siteId: z.string() }))
  .handler(async ({ data: input }) => {
    const getSite = async ({
      pageId,
      siteId,
      fresh,
    }: {
      siteId: string;
      pageId: string;
      fresh?: boolean;
    }) => {
      const url = new URL(process.env.API_URL + `/api/sites/${siteId}`);
      url.searchParams.set("pageId", pageId);
      url.searchParams.set("fresh", `${fresh}`);

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Failed to fetch site");
      }
      return (await res.json()) as {
        data: { site: Site; page: ExtendedRecordMap };
      };
    };

    const { pageId, siteId } = input;
    const { data } = await getSite({ pageId, siteId });
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
  });

export const Route = createFileRoute("/$siteId")({
  validateSearch: siteSearchSchema,
  loaderDeps({ search: { pageId } }) {
    return { pageId };
  },
  loader: async ({ params, deps }) => {
    const { siteId } = params;
    const { pageId } = deps;
    // const { data } = await getSite({ pageId, siteId });
    // const site = data?.site as Site;
    // const page = data?.page as ExtendedRecordMap;
    // const seo = getNotionPageSeo({ page, site, pageId });
    // const settings = { ...site?.siteSetting } as NotionPageSettings;
    // // const styles = covertPageSettingsIntoStyles(settings);
    // const fonts = {
    //   primary: getFontLink(settings?.typography?.fonts?.primary),
    //   secondary: getFontLink(settings?.typography?.fonts?.secondary),
    // };

    // return {
    //   site,
    //   page,
    //   seo,
    //   css: {
    //     // styles,
    //     fonts,
    //   },
    // };

    return await executor({ data: { pageId, siteId } });
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

  ssr: true,
});

function RouteComponent() {
  return (
    <ClientOnly fallback={null}>
      <LiveSite />
    </ClientOnly>
  );
}
