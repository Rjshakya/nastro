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

const getSite = async ({
  pageId,
  slug,
  // fresh,
}: {
  slug: string;
  pageId: string;
  fresh?: string;
}) => {
  const url = new URL(`/api/site`, env.API_URL);
  url.searchParams.set("slug", slug);
  url.searchParams.set("pageId", pageId);
  // url.searchParams.set("fresh", fresh ?? "");

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(
      `url : ${url.href} status : ${res.status} , statusText:${res.statusText} , msg: Failed to fetch site`,
    );
  }
  return res.json() as Promise<{
    data: { site: Site; page: ExtendedRecordMap };
  }>;
};

export const pageIdLoader = createServerFn()
  .inputValidator(
    z.object({
      pageId: z.string(),
      slug: z.string(),
      fresh: z.enum(["true", "false"]).optional(),
    }),
  )
  .handler(async ({ data: input }) => {
    try {
      const { pageId, fresh, slug } = input;
      const { data } = await getSite({ pageId, slug, fresh });
      const site = data?.site as Site;
      const page = data?.page as ExtendedRecordMap;
      const seo = getNotionPageSeo({ page, site, pageId });
      const settings = { ...site?.siteSetting } as NotionPageSettings;
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
