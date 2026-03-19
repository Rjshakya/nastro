import type { Site } from "#/types/site";
import type { ExtendedRecordMap } from "notion-types";
import { getNotionPageSeo } from "./utils";
import type { NotionPageSettings } from "#/types/customization";
import { getFontLink } from "./fonts";
import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

// export const getApiUrl = createServerOnlyFn(() => {
//   return env.API_URL;
// });

export const liveSiteLoader = createServerFn()
  .inputValidator(z.object({ pageId: z.string(), siteId: z.string() }))
  .handler(async ({ data: input }) => {
    try {
      const getSite = async ({
        pageId,
        siteId,
        fresh = false,
      }: {
        siteId: string;
        pageId: string;
        fresh?: boolean;
      }) => {
        const url = new URL(`/api/sites/${siteId}`, env.API_URL);
        url.searchParams.set("pageId", pageId);
        url.searchParams.set("fresh", `${fresh}`);

        const res = await fetch(url, {
          headers: {
            accept: "application/json",
          },
        });

        if (!res.ok) {
          console.debug("res headers", JSON.stringify(res.headers));
          throw new Error(
            `url : ${url.href} status : ${res.status} , statusText:${res.statusText} , msg: Failed to fetch site`,
          );
        }
        return res.json() as Promise<{
          data: { site: Site; page: ExtendedRecordMap };
        }>;
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
          fonts,
        },
      };
    } catch (e) {
      console.error(e);
    }
  });
